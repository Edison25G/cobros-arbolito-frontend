import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';

// ✅ IMPORTS DE ANGULAR FORMS
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// ✅ IMPORTS DE PRIMENG
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { AvatarModule } from 'primeng/avatar';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog'; // Para el Modal
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext'; // Para textos
import { ToggleSwitchModule } from 'primeng/toggleswitch';

// Servicios y Modelos
import { TerrenoService } from '../../../../core/services/terreno.service';
import { SocioService } from '../../../../core/services/socio.service';
import { BarriosService } from '../../../../core/services/barrios.service'; // ✅ Asegúrate que la ruta sea correcta
import { Socio } from '../../../../core/models/socio.interface';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
	selector: 'app-detalle-socio',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule, // ✅ Necesario para formularios
		ButtonModule,
		TagModule,
		TableModule,
		AvatarModule,
		TabsModule,
		ToastModule,
		DividerModule,
		SkeletonModule,
		TooltipModule,
		DialogModule, // ✅
		SelectModule, // ✅
		InputTextModule, // ✅
		ToggleSwitchModule, // ✅
		ConfirmDialogModule,
	],
	providers: [MessageService],
	templateUrl: './detalle-socio.component.html',
})
export class DetalleSocioComponent implements OnInit {
	// Inyecciones
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private socioService = inject(SocioService);
	private messageService = inject(MessageService);
	private fb = inject(FormBuilder); // ✅ Para crear el formulario
	private barriosService = inject(BarriosService); // ✅ Para cargar lista de barrios
	private terrenoService = inject(TerrenoService);
	private confirmationService = inject(ConfirmationService);
	// Datos del Socio
	socioId!: number;
	socio: Socio | null = null;
	isLoading = true;

	// Lógica del Modal de Terrenos
	mostrarModalTerreno = false;
	terrenoForm!: FormGroup;
	listaBarrios: any[] = [];
	terrenos: any[] = []; // Tabla local de terrenos
	esEdicion = false;
	idTerrenoEditar: number | null = null;
	// MOCK: Datos simulados de pagos
	historialPagos = [
		{ id: 1, mes: 'Noviembre 2025', monto: 3.5, estado: 'PAGADO', fecha_pago: '2025-11-05' },
		{ id: 2, mes: 'Diciembre 2025', monto: 5.0, estado: 'PENDIENTE', fecha_pago: null },
		{ id: 3, mes: 'Multa Minga Dic', monto: 10.0, estado: 'PENDIENTE', fecha_pago: null },
	];

	ngOnInit(): void {
		// 1. Inicializamos el formulario y cargamos catálogos
		this.initForm();
		this.cargarBarrios();

		// 2. Cargamos el socio de la URL
		this.route.paramMap.subscribe((params) => {
			const id = params.get('id');
			if (id) {
				this.socioId = +id;
				this.cargarSocio();
				this.cargarTerrenos();
			} else {
				this.volver();
			}
		});
	}

	// --- LÓGICA DEL FORMULARIO ---
	initForm() {
		this.terrenoForm = this.fb.group({
			barrio: [null, [Validators.required]],
			direccion: ['', [Validators.required]],
			tiene_medidor: [false],
			codigo_medidor: [''],
		});

		// Suscripción: Si activa el medidor, el código se vuelve obligatorio
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
			next: (data) => {
				this.terrenos = data;
			},
			error: (err) => console.error('Error cargando terrenos', err),
		});
	}
	cargarBarrios() {
		this.barriosService.getBarrios().subscribe({
			next: (data) => {
				// Solo mostramos barrios activos para asignar a terrenos
				this.listaBarrios = data.filter((b) => b.activo);
			},
			error: () => {},
		});
	}

	// --- ACCIONES DEL MODAL ---
	abrirModalTerreno() {
		this.esEdicion = false; // <--- Importante resetear esto
		this.idTerrenoEditar = null;
		this.terrenoForm.reset({ tiene_medidor: false });
		this.mostrarModalTerreno = true;
	}

	guardarTerreno() {
		if (this.terrenoForm.invalid) {
			this.terrenoForm.markAllAsTouched();
			return;
		}

		const formValue = this.terrenoForm.value;

		// Datos comunes
		const datosParaEnviar = {
			...formValue,
			socio_id: this.socioId,
			barrio_id: formValue.barrio,
			direccion: formValue.direccion,
			codigo_medidor: formValue.tiene_medidor ? formValue.codigo_medidor : null,
		};

		if (this.esEdicion && this.idTerrenoEditar) {
			// --- MODO EDICIÓN ---
			this.terrenoService.updateTerreno(this.idTerrenoEditar, datosParaEnviar).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Actualizado',
						detail: 'Terreno actualizado correctamente',
					});
					this.mostrarModalTerreno = false;
					this.cargarTerrenos();
				},
				error: (err) => {
					console.error(err);
					this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar.' });
				},
			});
		} else {
			// --- MODO CREACIÓN (El que ya tenías) ---
			this.terrenoService.createTerreno(datosParaEnviar).subscribe({
				next: () => {
					this.messageService.add({
						severity: 'success',
						summary: 'Creado',
						detail: 'Propiedad registrada correctamente',
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
	}

	// --- LÓGICA EXISTENTE ---
	cargarSocio(): void {
		this.isLoading = true;
		this.socioService
			.getSocioById(this.socioId)
			.pipe(
				tap((data) => {
					this.socio = data;
					this.isLoading = false;
				}),
				catchError((err) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: `No se pudo cargar: ${err.message}`,
					});
					this.isLoading = false;
					setTimeout(() => this.volver(), 2000);
					return of(null);
				}),
			)
			.subscribe();
	}

	editarTerreno(terreno: any) {
		this.esEdicion = true;
		this.idTerrenoEditar = terreno.id;

		// Intentamos obtener el ID de todas las formas posibles
		const rawBarrio = terreno.barrio_id || (terreno.barrio && terreno.barrio.id) || terreno.barrio;

		// Aseguramos que sea número
		const idBarrioReal = rawBarrio ? Number(rawBarrio) : null;

		this.terrenoForm.patchValue({
			barrio: idBarrioReal,
			direccion: terreno.direccion,
			tiene_medidor: terreno.tiene_medidor || (terreno.codigo_medidor ? true : false),
			codigo_medidor: terreno.codigo_medidor,
		});

		this.mostrarModalTerreno = true;
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
						this.cargarTerrenos(); // Recargar la tabla
					},
					error: (_err) => {
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
	volver(): void {
		this.router.navigate(['/dashboard/socios']);
	}

	getNombreBarrio(id: any): string {
		if (!this.listaBarrios || !id) return '---';
		const barrioEncontrado = this.listaBarrios.find((b) => b.id === Number(id));
		return barrioEncontrado ? barrioEncontrado.nombre : 'Desconocido';
	}
}
