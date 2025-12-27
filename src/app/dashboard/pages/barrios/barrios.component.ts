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
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

// Servicios y Modelos
import { BarriosService } from '@core/services/barrios.service';
import { SocioService } from '@core/services/socio.service'; // ✅ RESTAURADO
import { ErrorService } from '../../../auth/core/services/error.service';
import { Barrio } from '@core/interfaces/barrio.interface';
import { AuthService } from '../../../core/services/auth.service';
import { RolUsuario } from '@core/models/role.enum';

// Interfaz extendida para la UI (para guardar los contadores)
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
		ConfirmDialogModule,
	],
	providers: [MessageService, ConfirmationService],
	templateUrl: './barrios.component.html',
})
export class BarriosComponent implements OnInit {
	// Inyecciones
	private barriosService = inject(BarriosService);
	private socioService = inject(SocioService); // ✅ RESTAURADO
	private errorService = inject(ErrorService);
	private messageService = inject(MessageService);
	private confirmationService = inject(ConfirmationService);
	private router = inject(Router);
	private fb = inject(FormBuilder);
	private authService = inject(AuthService);
	// Datos
	barrios: BarrioUI[] = [];
	loading = true;

	// Estado Modal
	mostrarModalCrear = false;
	guardando = false;
	esEdicion = false;
	idBarrioEditar: number | null = null;
	barrioForm: FormGroup;
	currentUserRole: string | null = null;
	Role = RolUsuario;
	constructor() {
		this.barrioForm = this.fb.group({
			nombre: ['', [Validators.required]],
			descripcion: [''],
			activo: [true],
		});
	}

	ngOnInit() {
		this.currentUserRole = this.authService.getRole();
		this.cargarDatosReales();
	}

	cargarDatosReales() {
		this.loading = true;

		// 1. Cargamos los Barrios
		this.barriosService.getBarrios().subscribe({
			next: (dataBarrios) => {
				// Inicializamos los contadores en 0
				this.barrios = dataBarrios.map((b) => ({
					...b,
					cantidadSocios: 0,
					activos: 0,
					inactivos: 0,
				}));

				if (this.currentUserRole === RolUsuario.OPERADOR) {
					this.loading = false;
				} else {
					// Si es Admin o Tesorero, calculamos los contadores
					this.calcularContadores();
				}
			},
			error: (err) => {
				console.error(err);
				this.loading = false;
				this.errorService.showError('Error al cargar la lista de barrios.');
			},
		});
	}

	// ✅ ESTA ES LA FUNCIÓN QUE HACE LA MAGIA VISUAL AHORA MISMO
	calcularContadores() {
		this.socioService.getSocios().subscribe({
			next: (socios) => {
				socios.forEach((socio: any) => {
					// 1. EXTRACTOR DE ID INTELIGENTE
					let idDelSocio = null;

					if (socio.barrio_id) {
						idDelSocio = socio.barrio_id;
					} else if (socio.barrio) {
						// Puede venir como objeto {id: 1...} o como número directo (2)
						idDelSocio = typeof socio.barrio === 'object' ? socio.barrio.id : socio.barrio;
					} else if (socio.barrio_domicilio_id) {
						idDelSocio = socio.barrio_domicilio_id;
					}

					// 2. BUSCAR Y SUMAR
					// Usamos '==' para comparar sin importar si es texto o número
					const barrioEncontrado = this.barrios.find((b) => b.id == idDelSocio);

					if (barrioEncontrado) {
						barrioEncontrado.cantidadSocios = (barrioEncontrado.cantidadSocios || 0) + 1;

						// Contar activos/inactivos
						const estaActivo = socio.esta_activo ?? socio.is_active ?? socio.activo ?? true;
						if (estaActivo) {
							barrioEncontrado.activos = (barrioEncontrado.activos || 0) + 1;
						} else {
							barrioEncontrado.inactivos = (barrioEncontrado.inactivos || 0) + 1;
						}
					}
				});

				this.loading = false;
			},
			error: (_err) => {
				this.loading = false;
			},
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
				const { severity, detail } = this.interpretarError(err);
				this.messageService.add({ severity, summary: 'Atención', detail });
			},
		});
	}

	private interpretarError(err: any): { severity: string; detail: string } {
		console.warn('🔥 API Error:', err);
		if (err.status === 400 && err.error) {
			let mensaje = 'Verifique los datos ingresados.';
			if (err.error.error) {
				mensaje = err.error.error;
			} else if (err.error.nombre) {
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

	verDetalle(barrio: any) {
		// ✅ 5. OPCIONAL: Evitar que el Operador entre al detalle (porque ahí también fallará)
		if (this.currentUserRole === RolUsuario.OPERADOR) {
			this.messageService.add({
				severity: 'info',
				summary: 'Acceso Restringido',
				detail: 'Los operadores no gestionan socios.',
			});
			return;
		}

		if (barrio.id) {
			this.router.navigate(['/dashboard/barrios/detalle', barrio.id]);
		}
	}
}
