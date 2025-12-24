import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// --- PrimeNG IMPORTS ---
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { AutoFocusModule } from 'primeng/autofocus';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

// Servicios y Modelos
import { BarriosService } from '@core/services/barrios.service';
import { SocioService } from '@core/services/socio.service';
import { ErrorService } from '../../../auth/core/services/error.service';
import { Barrio } from '@core/interfaces/barrio.interface';

interface BarrioUI extends Barrio {
	cantidadSocios?: number;
	activos?: number;
	inactivos?: number;
}

@Component({
	selector: 'amc-barrios',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		CardModule,
		ButtonModule,
		SkeletonModule,
		ToastModule,
		DialogModule,
		InputTextModule,
		TextareaModule,
		ToggleSwitchModule,
		AutoFocusModule,
		ConfirmDialogModule,
	],
	providers: [MessageService, ConfirmationService],
	templateUrl: './barrios.component.html',
})
export class BarriosComponent implements OnInit {
	// Inyecciones
	private barriosService = inject(BarriosService);
	private socioService = inject(SocioService);
	private errorService = inject(ErrorService);
	private messageService = inject(MessageService);
	private confirmationService = inject(ConfirmationService);
	private router = inject(Router);
	private fb = inject(FormBuilder);

	// Datos
	barrios: BarrioUI[] = [];
	loading = true;

	// Estado Modal
	mostrarModalCrear = false;
	guardando = false;
	esEdicion = false;
	idBarrioEditar: number | null = null;
	barrioForm: FormGroup;

	constructor() {
		this.barrioForm = this.fb.group({
			nombre: ['', [Validators.required]],
			descripcion: [''],
			activo: [true],
		});
	}

	ngOnInit() {
		this.cargarDatosReales();
	}

	cargarDatosReales() {
		this.loading = true;
		this.barriosService.getBarrios().subscribe({
			next: (dataBarrios) => {
				this.barrios = dataBarrios.map((b) => ({
					...b,
					cantidadSocios: 0,
					activos: 0,
					inactivos: 0,
				}));
				this.calcularContadores();
				this.loading = false;
			},
			error: (err) => {
				console.error(err);
				this.loading = false;
				this.errorService.showError('Error al cargar la lista de barrios.');
			},
		});
	}

	calcularContadores() {
		this.socioService.getSocios().subscribe({
			next: (socios) => {
				socios.forEach((socio) => {
					const barrioEncontrado = // Buscamos por ID, que es mucho más seguro
						this.barrios.find((b) => b.id === socio.barrio_id);
					if (barrioEncontrado) {
						barrioEncontrado.cantidadSocios = (barrioEncontrado.cantidadSocios || 0) + 1;
						if (socio.esta_activo) {
							barrioEncontrado.activos = (barrioEncontrado.activos || 0) + 1;
						} else {
							barrioEncontrado.inactivos = (barrioEncontrado.inactivos || 0) + 1;
						}
					}
				});
			},
			error: (_err) => console.warn('No se pudieron cargar contadores de socios'),
		});
	}

	// --- MODAL: CREAR Y EDITAR ---

	abrirModalNuevo() {
		this.esEdicion = false;
		this.idBarrioEditar = null;
		this.barrioForm.reset({ activo: true });
		this.mostrarModalCrear = true;
	}

	editarBarrio(barrio: BarrioUI, event: Event) {
		event.stopPropagation();
		this.esEdicion = true;
		this.idBarrioEditar = barrio.id;

		this.barrioForm.patchValue({
			nombre: barrio.nombre,
			descripcion: barrio.descripcion,
			activo: barrio.activo,
		});

		this.mostrarModalCrear = true;
	}

	// ✅ VERSIÓN LIMPIA Y OPTIMIZADA
	guardarBarrio() {
		if (this.barrioForm.invalid) {
			this.barrioForm.markAllAsTouched();
			return;
		}

		this.guardando = true;
		const datos = this.barrioForm.value;

		const peticion =
			this.esEdicion && this.idBarrioEditar
				? this.barriosService.updateBarrio(this.idBarrioEditar, datos)
				: this.barriosService.createBarrio(datos);

		peticion.subscribe({
			next: () => {
				this.messageService.add({
					severity: 'success',
					summary: 'Éxito',
					detail: this.esEdicion ? 'Barrio actualizado' : 'Barrio creado correctamente',
				});
				this.cerrarModal();
				this.cargarDatosReales();
			},
			error: (err) => {
				this.guardando = false;
				// Delegamos la interpretación del error a una función auxiliar
				const { severity, detail } = this.interpretarError(err);
				this.messageService.add({ severity, summary: 'Atención', detail });
			},
		});
	}

	/**
	 * 🧹 Helper privado para limpiar la lógica de errores
	 */
	private interpretarError(err: any): { severity: string; detail: string } {
		console.warn('🔥 API Error:', err);

		if (err.status === 400 && err.error) {
			let mensaje = 'Verifique los datos ingresados.';

			// Prioridad 1: { "error": "texto" }
			if (err.error.error) {
				mensaje = err.error.error;
			}
			// Prioridad 2: { "nombre": ["texto"] }
			else if (err.error.nombre) {
				mensaje = Array.isArray(err.error.nombre) ? err.error.nombre[0] : err.error.nombre;
			}

			return { severity: 'warn', detail: mensaje };
		}

		if (err.status === 500) {
			return { severity: 'error', detail: 'Error interno del servidor.' };
		}

		return { severity: 'error', detail: 'No se pudo completar la operación.' };
	}

	cerrarModal() {
		this.mostrarModalCrear = false;
		this.guardando = false;
		this.esEdicion = false;
		this.idBarrioEditar = null;
		this.barrioForm.reset({ activo: true });
	}

	// --- DESACTIVAR (LÓGICO) ---

	eliminarBarrio(barrio: BarrioUI, event: Event) {
		event.stopPropagation();

		this.confirmationService.confirm({
			message: `¿Estás seguro de desactivar el barrio "${barrio.nombre}"?`,
			header: 'Confirmar Desactivación',
			icon: 'pi pi-exclamation-triangle',
			acceptButtonStyleClass: 'p-button-warning p-button-text',
			rejectButtonStyleClass: 'p-button-text p-button-text',
			acceptLabel: 'Sí, desactivar',
			rejectLabel: 'Cancelar',

			accept: () => {
				this.barriosService.updateBarrio(barrio.id, { activo: false }).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Desactivado',
							detail: 'El barrio ha sido desactivado correctamente',
						});

						// NOTA: Si tu backend filtra los inactivos, aquí desaparecerá el barrio.
						// Si quieres que se quede rojo sin desaparecer, usa el truco de actualización local
						// que vimos antes en lugar de cargarDatosReales().
						this.cargarDatosReales();
					},
					error: (err) => {
						console.error(err);
						this.messageService.add({
							severity: 'error',
							summary: 'Error',
							detail: 'No se pudo desactivar el barrio.',
						});
					},
				});
			},
		});
	}

	verDetalle(nombre: string) {
		this.router.navigate(['/dashboard/barrios/detalle', nombre]);
	}
}
