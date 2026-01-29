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
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PageHeaderComponent } from '../../../common/components/page-header/page-header.component';

@Component({
	selector: 'amc-socios',
	standalone: true,
	imports: [
		CommonModule,
		HttpClientModule,
		ReactiveFormsModule,
		PageHeaderComponent,
		// Componentes PrimeNG v20 Standalone
		TableModule,
		DialogModule,
		ButtonModule,
		InputTextModule,
		SelectModule,
		ToggleSwitchModule,
		TagModule,
		TooltipModule,
		IconFieldModule,
		InputIconModule,
	],
	// providers: [MessageService, ConfirmationService], // <-- ELIMINADO para usar instancias globales
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

	// Control del Modal
	showSocioModal = false;
	isEditMode = false;
	currentSocioId: number | null = null;

	// Formulario
	socioForm: FormGroup;

	// Opciones para Dropdowns
	public rolUsuarioEnum = RolUsuario;
	rolesOptions = Object.values(RolUsuario).map((rol) => ({ label: rol, value: rol }));

	tipoIdentificacionOptions = [
		{ label: 'Cédula', value: 'C' },
		{ label: 'RUC', value: 'R' },
		{ label: 'Pasaporte', value: 'P' },
	];

	constructor() {
		this.socioForm = this.fb.group({
			tipo_identificacion: ['C', Validators.required],
			identificacion: ['', [Validators.required]], // Validadores dinámicos se agregan luego
			nombres: ['', Validators.required],
			apellidos: ['', Validators.required],
			barrio_id: [null, Validators.required],
			direccion: ['', Validators.required],
			rol: [RolUsuario.SOCIO, Validators.required],
			email: ['', [Validators.email]],
			telefono: [''],
			esta_activo: [true],
		});

		// Escuchar cambios en tipo de identificación para actualizar validadores
		this.socioForm.get('tipo_identificacion')?.valueChanges.subscribe((tipo) => {
			this.updateIdentificacionValidators(tipo);
			this.socioForm.get('identificacion')?.updateValueAndValidity();
		});
	}

	ngOnInit(): void {
		this.loadSocios();
		this.cargarBarrios();
		// Inicializar validadores con el valor por defecto ('C')
		this.updateIdentificacionValidators('C');
	}

	updateIdentificacionValidators(tipo: string) {
		const identControl = this.socioForm.get('identificacion');
		identControl?.clearValidators();
		identControl?.addValidators(Validators.required);

		if (tipo === 'C') {
			identControl?.addValidators([Validators.pattern(/^\d{10}$/)]); // 10 dígitos numéricos
		} else if (tipo === 'R') {
			identControl?.addValidators([Validators.pattern(/^\d{13}$/)]); // 13 dígitos numéricos
		} else if (tipo === 'P') {
			identControl?.addValidators([Validators.minLength(5)]); // Mínimo 5 caracteres
		}
	}

	loadSocios(): void {
		this.socioService
			.getSocios()
			.pipe(
				tap((data) => (this.socios = data)),
				catchError((err) => {
					this.mostrarError('Error al cargar socios', err.message);
					return of([]);
				}),
			)
			.subscribe();
	}

	cargarBarrios() {
		this.barriosService.getBarrios().subscribe({
			next: (data) => {
				this.listaBarrios = data.filter((b) => b.activo);
			},
			error: (err) => {
				console.error(err);
				this.mostrarError('Error', 'No se pudieron cargar los barrios.');
			},
		});
	}

	// --- MÉTODOS DEL MODAL ---

	openNewSocioModal(): void {
		this.isEditMode = false;
		this.currentSocioId = null;
		this.socioForm.reset({
			tipo_identificacion: 'C',
			rol: RolUsuario.SOCIO,
			esta_activo: true,
		});
		this.updateIdentificacionValidators('C');
		this.socioForm.enable(); // Habilita todo
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
			tipo_identificacion: socio.tipo_identificacion || 'C',
			identificacion: socio.identificacion,
			nombres: socio.nombres,
			apellidos: socio.apellidos,
			email: socio.email,
			telefono: socio.telefono,
			barrio_id: idBarrioReal,
			direccion: socio.direccion,
			rol: socio.rol,
			esta_activo: socio.esta_activo,
		});

		// En modo edición, a veces no se permite cambiar la identificación.
		// Si quieres permitirlo, comenta la siguiente línea:
		// this.f['identificacion'].disable();

		this.updateIdentificacionValidators(this.f['tipo_identificacion'].value);
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
				detail: 'Por favor, revise los errores en el formulario.',
			});
			return;
		}

		const formValues = this.socioForm.getRawValue();

		// Construir objeto DTO
		const datosParaEnviar: any = {
			...formValues,
			// Asegurar que barrio_id sea número
			barrio_id: Number(formValues.barrio_id),
		};

		let request$: Observable<any>;

		if (this.isEditMode && this.currentSocioId) {
			request$ = this.socioService.updateSocio(this.currentSocioId, datosParaEnviar);
		} else {
			request$ = this.socioService.createSocio(datosParaEnviar);
		}

		request$.subscribe({
			next: () => {
				this.messageService.add({
					severity: 'success',
					summary: 'Éxito',
					detail: `Socio ${this.isEditMode ? 'actualizado' : 'creado'} correctamente.`,
				});
				this.loadSocios();
				this.closeSocioModal();
			},
			error: (err) => {
				console.error('Error al guardar socio:', err);

				// Manejo de errores de validación del backend (400)
				if (err.status === 400 && err.error) {
					// err.error es objeto tipo { identificacion: ['Error...'], email: ['Error...'] }
					const validationErrors = err.error;

					// Recorremos los errores y los asignamos a los controles del formulario
					Object.keys(validationErrors).forEach((key) => {
						const control = this.socioForm.get(key);
						if (control) {
							// Seteamos el error en el control
							control.setErrors({ backend: validationErrors[key][0] });
							control.markAsTouched();
						}
					});

					this.messageService.add({
						severity: 'error',
						summary: 'Error de Validación',
						detail: 'Verifique los campos marcados en rojo.',
					});
				} else {
					// Otro tipo de error (500, conexión, etc)
					const msg = err.message || 'Ocurrió un error inesperado.';
					this.mostrarError('Error al guardar', msg);
				}
			},
		});
	}

	deleteSocio(id: number): void {
		this.confirmationService.confirm({
			message: '¿Está seguro de que desea eliminar este socio?',
			header: 'Confirmar Eliminación',
			icon: 'pi pi-exclamation-triangle',
			acceptLabel: 'Sí, eliminar',
			rejectLabel: 'Cancelar',
			accept: () => {
				this.socioService.deleteSocio(id).subscribe({
					next: () => {
						this.messageService.add({
							severity: 'success',
							summary: 'Eliminado',
							detail: 'Socio eliminado correctamente.',
						});
						this.loadSocios();
					},
					error: (err) => this.mostrarError('Error', err.message),
				});
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
		// Implementación solicitada: Buscar nombre en lista local por ID
		if (!this.listaBarrios || !id) return '---';
		const barrioEncontrado = this.listaBarrios.find((b) => b.id === Number(id));
		return barrioEncontrado ? barrioEncontrado.nombre : 'Desconocido';
	}

	mostrarError(summary: string, detail: string) {
		this.messageService.add({ severity: 'error', summary, detail });
	}

	// Helper para mostrar errores en el template
	getIdentificacionError(): string {
		const control = this.f['identificacion'];
		if (control.errors) {
			if (control.errors['required']) return 'La identificación es obligatoria.';
			if (control.errors['pattern']) {
				const tipo = this.f['tipo_identificacion'].value;
				if (tipo === 'C') return 'La cédula debe tener 10 dígitos numéricos.';
				if (tipo === 'R') return 'El RUC debe tener 13 dígitos numéricos.';
			}
			if (control.errors['minlength']) return 'Debe tener al menos 5 caracteres.';
			if (control.errors['backend']) return control.errors['backend']; // Error que viene del backend
		}
		return '';
	}
}
