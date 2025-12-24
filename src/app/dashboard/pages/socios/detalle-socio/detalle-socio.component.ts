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
	// Datos del Socio
	socioId!: number;
	socio: Socio | null = null;
	isLoading = true;

	// Lógica del Modal de Terrenos
	mostrarModalTerreno = false;
	terrenoForm!: FormGroup;
	listaBarrios: any[] = [];
	terrenos: any[] = []; // Tabla local de terrenos

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
			error: () => console.warn('No se pudieron cargar los barrios'),
		});
	}

	// --- ACCIONES DEL MODAL ---
	abrirModalTerreno() {
		this.terrenoForm.reset({ tiene_medidor: false });
		this.mostrarModalTerreno = true;
	}

	guardarTerreno() {
		if (this.terrenoForm.invalid) {
			this.terrenoForm.markAllAsTouched();
			return;
		}
		const formValue = this.terrenoForm.value;
		// Preparamos los datos para enviar al Backend
		const datosParaEnviar = {
			...this.terrenoForm.value,
			socio_id: this.socioId, // ⚠️ IMPORTANTE: Hay que decirle de quién es el terreno
			barrio_id: formValue.barrio, // Aquí ahora va el ID gracias al cambio en el HTML
			direccion: formValue.direccion,
			// NOTA: Revisa con tu backend si quiere el NOMBRE ('Alpamalag') o el ID (1) del barrio.
			// Si tu dropdown tiene optionValue="nombre", enviará el nombre.
			codigo_medidor: formValue.tiene_medidor ? formValue.codigo_medidor : null,
		};

		this.terrenoService.createTerreno(datosParaEnviar).subscribe({
			next: (_terrenoCreado) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Éxito',
					detail: 'Propiedad registrada correctamente',
				});
				this.mostrarModalTerreno = false;
				this.cargarTerrenos();
			},
			error: (err) => {
				console.error(err);
				// Mensaje más descriptivo por si falla
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'No se pudo guardar. Verifique que el código de medidor no esté repetido.',
				});
			},
		});
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

	volver(): void {
		this.router.navigate(['/dashboard/socios']);
	}

	getNombreBarrio(id: any): string {
		if (!this.listaBarrios || !id) return '---';
		const barrioEncontrado = this.listaBarrios.find((b) => b.id === Number(id));
		return barrioEncontrado ? barrioEncontrado.nombre : 'Desconocido';
	}
}
