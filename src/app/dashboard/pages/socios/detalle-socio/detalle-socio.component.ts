import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';

// Angular Forms
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { AvatarModule } from 'primeng/avatar';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

// Servicios y Modelos
import { TerrenoService } from '../../../../core/services/terreno.service';
import { SocioService } from '../../../../core/services/socio.service';
import { BarriosService } from '../../../../core/services/barrios.service';
import { FacturacionService } from '../../../../core/services/facturacion.service';
import { ComprobanteService } from '../../../../core/services/comprobante.service';
import { Socio } from '../../../../core/models/socio.interface';

@Component({
	selector: 'app-detalle-socio',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		ButtonModule,
		TagModule,
		TableModule,
		AvatarModule,
		TabsModule,
		ToastModule,
		DividerModule,
		SkeletonModule,
		TooltipModule,
		DialogModule,
		SelectModule,
		InputTextModule,
		ToggleSwitchModule,
		ConfirmDialogModule,
	],
	providers: [MessageService, ConfirmationService],
	templateUrl: './detalle-socio.component.html',
})
export class DetalleSocioComponent implements OnInit {
	// --- INYECCIONES DE DEPENDENCIAS ---
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private fb = inject(FormBuilder);

	// Servicios de Negocio
	private socioService = inject(SocioService);
	private barriosService = inject(BarriosService);
	private terrenoService = inject(TerrenoService);
	private facturacionService = inject(FacturacionService);
	private comprobanteService = inject(ComprobanteService);

	// Servicios de UI
	private messageService = inject(MessageService);
	private confirmationService = inject(ConfirmationService);

	// --- VARIABLES DE ESTADO ---
	socioId!: number;
	socio: Socio | null = null;
	isLoading = true;
	historialPagos: any[] = []; // Lista real de facturas

	// Variables para Gestión de Terrenos
	mostrarModalTerreno = false;
	terrenoForm!: FormGroup;
	listaBarrios: any[] = [];
	terrenos: any[] = [];
	esEdicion = false;
	idTerrenoEditar: number | null = null;

	ngOnInit(): void {
		this.initForm();
		this.cargarBarrios();

		// Obtener ID de la URL
		this.route.paramMap.subscribe((params) => {
			const id = params.get('id');
			if (id) {
				this.socioId = +id;
				this.cargarSocio(); // Carga socio + historial
				this.cargarTerrenos();
			} else {
				this.volver();
			}
		});
	}

	// ==========================================================
	// 1. GESTIÓN DE SOCIOS Y DATOS GENERALES
	// ==========================================================

	cargarSocio(): void {
		this.isLoading = true;
		this.socioService
			.getSocioById(this.socioId)
			.pipe(
				tap((data) => {
					this.socio = data;
					this.isLoading = false;
					// Una vez tenemos la cédula, cargamos sus facturas
					this.cargarHistorialReal();
				}),
				catchError((err) => {
					this.manejarErrorCarga(err);
					return of(null);
				}),
			)
			.subscribe();
	}

	cargarHistorialReal() {
		if (this.socio?.cedula) {
			this.facturacionService.getFacturasPorSocio(this.socio.cedula).subscribe({
				next: (res: any) => {
					// Soporte para respuestas {data: []} o [] directo
					this.historialPagos = Array.isArray(res) ? res : res.data;
				},
				error: (err) => console.error('Error cargando historial:', err),
			});
		}
	}

	// ==========================================================
	// 2. GESTIÓN DE TERRENOS (CRUD)
	// ==========================================================

	initForm() {
		this.terrenoForm = this.fb.group({
			barrio: [null, [Validators.required]],
			direccion: ['', [Validators.required]],
			tiene_medidor: [false],
			codigo_medidor: [''],
		});

		// Validación condicional: Si hay medidor, el código es obligatorio
		this.terrenoForm.get('tiene_medidor')?.valueChanges.subscribe((tieneMedidor) => {
			const codigoControl = this.terrenoForm.get('codigo_medidor');
			if (tieneMedidor) {
				codigoControl?.setValidators([Validators.required]);
			} else {
				codigoControl?.clearValidators();
				codigoControl?.setValue('');
			}
			codigoControl?.updateValueAndValidity();
		});
	}

	cargarTerrenos() {
		this.terrenoService.getTerrenosPorSocio(this.socioId).subscribe({
			next: (data) => (this.terrenos = data),
			error: (err) => console.error('Error cargando terrenos', err),
		});
	}

	cargarBarrios() {
		this.barriosService.getBarrios().subscribe({
			next: (data) => (this.listaBarrios = data.filter((b) => b.activo)),
			error: () => {}, // Silencioso si falla catálogo
		});
	}

	abrirModalTerreno() {
		this.esEdicion = false;
		this.idTerrenoEditar = null;
		this.terrenoForm.reset({ tiene_medidor: false });
		this.mostrarModalTerreno = true;
	}

	editarTerreno(terreno: any) {
		this.esEdicion = true;
		this.idTerrenoEditar = terreno.id;

		// Normalización de ID de barrio
		const rawBarrio = terreno.barrio_id || (terreno.barrio && terreno.barrio.id) || terreno.barrio;
		const idBarrioReal = rawBarrio ? Number(rawBarrio) : null;

		this.terrenoForm.patchValue({
			barrio: idBarrioReal,
			direccion: terreno.direccion,
			tiene_medidor: terreno.tiene_medidor || !!terreno.codigo_medidor,
			codigo_medidor: terreno.codigo_medidor,
		});

		this.mostrarModalTerreno = true;
	}

	guardarTerreno() {
		if (this.terrenoForm.invalid) {
			this.terrenoForm.markAllAsTouched();
			return;
		}

		const formValue = this.terrenoForm.value;
		const datosParaEnviar = {
			...formValue,
			socio_id: this.socioId,
			barrio_id: formValue.barrio,
			direccion: formValue.direccion,
			codigo_medidor: formValue.tiene_medidor ? formValue.codigo_medidor : null,
		};

		const operacion$ =
			this.esEdicion && this.idTerrenoEditar
				? this.terrenoService.updateTerreno(this.idTerrenoEditar, datosParaEnviar)
				: this.terrenoService.createTerreno(datosParaEnviar);

		operacion$.subscribe({
			next: () => {
				this.messageService.add({
					severity: 'success',
					summary: this.esEdicion ? 'Actualizado' : 'Creado',
					detail: 'Propiedad guardada correctamente',
				});
				this.mostrarModalTerreno = false;
				this.cargarTerrenos();
			},
			error: (err) => {
				console.error(err);
				this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar.' });
			},
		});
	}

	eliminarTerreno(terreno: any) {
		this.confirmationService.confirm({
			message: `¿Estás seguro de eliminar el terreno en "${terreno.direccion}"?`,
			header: 'Confirmar Eliminación',
			icon: 'pi pi-exclamation-triangle',
			acceptLabel: 'Sí, eliminar',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				this.terrenoService.deleteTerreno(terreno.id).subscribe({
					next: () => {
						this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Terreno eliminado.' });
						this.cargarTerrenos();
					},
					error: () => {
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: 'No se pudo eliminar (puede tener lecturas asociadas).',
						});
					},
				});
			},
		});
	}

	// ==========================================================
	// 3. IMPRESIÓN DE TICKETS RIDE
	// ==========================================================

	imprimirFacturaSocio(item: any) {
		// Reconstrucción de datos para el Servicio de Impresión
		const socioData = {
			nombres: this.socio?.nombres,
			apellidos: this.socio?.apellidos,
			cedula: this.socio?.cedula,
			direccion: this.socio?.direccion || 'S/N',
		};

		const facturaData = {
			id: item.factura_id,
			fecha_emision: item.fecha_emision,
			total: item.total,
			clave_acceso_sri: item.clave_acceso_sri, // Clave vital para código de barras
			estado_sri: item.estado_sri,
		};

		// Simulamos método de pago histórico
		const pagosData = [{ metodo: 'EFECTIVO/HISTORIAL', monto: item.total }];

		this.comprobanteService.generarTicketProfesional(socioData, facturaData, pagosData);
	}

	// ==========================================================
	// 4. UTILITARIOS
	// ==========================================================

	getNombreBarrio(id: any): string {
		if (!this.listaBarrios || !id) return '---';
		const barrio = this.listaBarrios.find((b) => b.id === Number(id));
		return barrio ? barrio.nombre : 'Desconocido';
	}

	volver(): void {
		this.router.navigate(['/dashboard/socios']);
	}

	private manejarErrorCarga(err: any) {
		this.messageService.add({
			severity: 'error',
			summary: 'Error',
			detail: `No se pudo cargar: ${err.message}`,
		});
		this.isLoading = false;
		setTimeout(() => this.volver(), 2000);
	}
}
