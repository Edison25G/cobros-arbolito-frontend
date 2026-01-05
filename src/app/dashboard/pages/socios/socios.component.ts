import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Observable, catchError, of, tap } from 'rxjs';
import { Router } from '@angular/router';
// Importaciones con las rutas correctas según tu arquitectura
import { Socio } from '../../../core/models/socio.interface';
import { SocioService } from '../../../core/services/socio.service';
import { RolUsuario } from '../../../core/models/role.enum';
import { BarriosService } from '../../../core/services/barrios.service'; // Ajusta la ruta
import { Barrio } from '../../../core/interfaces/barrio.interface';
// ==========================================================
// ¡CORRECCIÓN DE PRIMENG v20! (Basado en tus imágenes)
// ==========================================================
import { TableModule, Table } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch'; // <-- CORREGIDO (Era InputSwitch)
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
	selector: 'amc-socios',
	standalone: true,
	imports: [
		CommonModule,
		HttpClientModule,
		ReactiveFormsModule,
		// Componentes PrimeNG v20 Standalone
		TableModule,
		DialogModule,
		ButtonModule,
		InputTextModule,
		SelectModule, // <-- CORREGIDO
		ToggleSwitchModule, // <-- CORREGIDO
		ToastModule,
		ConfirmDialogModule,
		TagModule,
		TooltipModule,
		IconFieldModule,
		InputIconModule,
	],
	providers: [MessageService, ConfirmationService],
	templateUrl: './socios.component.html',
	styleUrls: ['./socios.component.css'],
})
export class SociosComponent implements OnInit {
	// Inyección de dependencias
	private socioService = inject(SocioService);
	private barriosService = inject(BarriosService);
	private fb = inject(FormBuilder);
	private messageService = inject(MessageService);
	private confirmationService = inject(ConfirmationService);
	private router = inject(Router);

	// Estado del componente
	socios: Socio[] = [];
	listaBarrios: Barrio[] = [];
	isLoading = true;

	// Control del Modal
	showSocioModal = false;
	isEditMode = false;
	currentSocioId: number | null = null;

	// Formulario
	socioForm: FormGroup;

	// Opciones para el Dropdown de Rol
	public rolUsuarioEnum = RolUsuario;
	rolesOptions: any[];

	constructor() {
		this.socioForm = this.fb.group({
			cedula: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
			nombres: ['', Validators.required],
			apellidos: ['', Validators.required],
			barrio_id: [null, Validators.required],
			direccion: ['', Validators.required],
			rol: [RolUsuario.SOCIO, Validators.required],
			email: ['', [Validators.email]],
			telefono: [''],
			esta_activo: [true],
		});

		// Preparamos las opciones para el p-select
		this.rolesOptions = Object.values(RolUsuario).map((rol) => ({
			label: rol, // El texto que se muestra
			value: rol, // El valor que se guarda
		}));
	}

	ngOnInit(): void {
		this.loadSocios();
		this.cargarBarrios();
	}

	loadSocios(): void {
		this.isLoading = true;
		this.socioService
			.getSocios()
			.pipe(
				tap((data) => {
					this.socios = data;
					this.isLoading = false;
				}),
				catchError((err) => {
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: `Error al cargar socios: ${err.message}`,
					});
					this.isLoading = false;
					return of([]);
				}),
			)
			.subscribe();
	}
	cargarBarrios() {
		this.barriosService.getBarrios().subscribe({
			next: (data) => {
				// Solo mostramos los barrios activos para que no registren en uno borrado
				// Asegúrate de que tu interfaz Barrio tenga la propiedad 'activo'
				this.listaBarrios = data.filter((b) => b.activo);
			},
			error: (err) => {
				console.error('Error cargando barrios', err);
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'No se pudieron cargar los barrios.',
				});
			},
		});
	}
	// --- MÉTODOS DEL MODAL ---

	openNewSocioModal(): void {
		this.isEditMode = false;
		this.currentSocioId = null;
		this.socioForm.reset({
			rol: RolUsuario.SOCIO,
			esta_activo: true,
		});
		this.f['cedula'].enable();
		this.showSocioModal = true;
	}

	verDetalle(id: number) {
		this.router.navigate(['/dashboard/socios/detalle', id]);
	}
	openEditSocioModal(socio: Socio): void {
		this.isEditMode = true;
		this.currentSocioId = socio.id!;
		const rawBarrio = socio.barrio_id || (socio as any).barrio_domicilio_id || (socio as any).barrio;
		const idBarrioReal = rawBarrio ? Number(rawBarrio) : null;
		this.socioForm.patchValue({
			cedula: socio.cedula,
			nombres: socio.nombres,
			apellidos: socio.apellidos,
			email: socio.email,
			telefono: socio.telefono,
			barrio_id: idBarrioReal,
			direccion: socio.direccion,
			rol: socio.rol,
			esta_activo: socio.esta_activo,
		});

		this.f['cedula'].disable(); // La cédula no se debe editar
		this.showSocioModal = true;
	}

	closeSocioModal(): void {
		this.showSocioModal = false;
	}

	// --- MÉTODOS CRUD ---

	saveSocio(): void {
		if (this.socioForm.invalid) {
			this.socioForm.markAllAsTouched();
			this.messageService.add({
				severity: 'warn',
				summary: 'Formulario Inválido',
				detail: 'Por favor, revise los campos requeridos (Barrio y Dirección son obligatorios).',
			});
			return;
		}

		const formValues = this.socioForm.getRawValue();

		// ✅ CORRECCIÓN: Preparamos el objeto limpio
		const datosParaEnviar = {
			cedula: formValues.cedula,
			nombres: formValues.nombres,
			apellidos: formValues.apellidos,
			email: formValues.email,
			telefono: formValues.telefono,

			// Los campos nuevos obligatorios
			barrio_id: formValues.barrio_id,

			direccion: formValues.direccion,

			rol: formValues.rol,
			esta_activo: formValues.esta_activo,
		};

		let request$: Observable<any>;

		if (this.isEditMode && this.currentSocioId) {
			// EDITAR
			request$ = this.socioService.updateSocio(this.currentSocioId, datosParaEnviar);
		} else {
			// CREAR
			// Al crear, no solemos enviar 'esta_activo' (el backend lo pone true por defecto),
			// pero si tu backend lo acepta, déjalo.
			request$ = this.socioService.createSocio(datosParaEnviar);
		}

		request$
			.pipe(
				tap(() => {
					this.messageService.add({
						severity: 'success',
						summary: 'Éxito',
						detail: `Socio ${this.isEditMode ? 'actualizado' : 'creado'} correctamente.`,
					});
					this.loadSocios();
					this.closeSocioModal();
				}),
				catchError((err) => {
					console.error(err);
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'No se pudo guardar. Verifique los datos.',
					});
					return of(null);
				}),
			)
			.subscribe();
	}
	deleteSocio(id: number): void {
		this.confirmationService.confirm({
			message: '¿Está seguro de que desea eliminar (desactivar) este socio? Esta acción es reversible.',
			header: 'Confirmar Eliminación',
			icon: 'pi pi-exclamation-triangle',
			acceptLabel: 'Sí, eliminar',
			rejectLabel: 'Cancelar',
			accept: () => {
				this.socioService
					.deleteSocio(id)
					.pipe(
						tap(() => {
							this.messageService.add({
								severity: 'success',
								summary: 'Eliminado',
								detail: 'Socio marcado como inactivo.',
							});
							this.loadSocios();
						}),
						catchError((err) => {
							this.messageService.add({
								severity: 'error',
								summary: 'Error',
								detail: err.message,
							});
							return of(null);
						}),
					)
					.subscribe();
			},
		});
	}

	// --- Helpers ---
	get f() {
		return this.socioForm.controls;
	}

	filterGlobal(event: Event, dt: Table) {
		dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
	}
	getNombreBarrio(id: any): string {
		// Si la lista no ha cargado o el id es nulo
		if (!this.listaBarrios || !id) return '---';

		// Buscamos el barrio en la lista que ya tienes descargada
		// Nota: Asegúrate que tu interfaz Barrio tenga 'id' y 'nombre'
		const barrioEncontrado = this.listaBarrios.find((b) => b.id === Number(id));

		return barrioEncontrado ? barrioEncontrado.nombre : 'Desconocido';
	}
}
