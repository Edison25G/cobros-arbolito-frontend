import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Observable, catchError, of, tap } from 'rxjs';

// Importaciones con las rutas correctas según tu arquitectura
import { Socio } from '../../../core/models/socio.interface';
import { SocioService } from '../../../core/services/socio.service';
import { RolUsuario } from '../../../core/models/role.enum';

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
	private fb = inject(FormBuilder);
	private messageService = inject(MessageService);
	private confirmationService = inject(ConfirmationService);

	// Estado del componente
	socios: Socio[] = [];
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
			barrio: ['', Validators.required],
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

	openEditSocioModal(socio: Socio): void {
		this.isEditMode = true;
		this.currentSocioId = socio.id;
		this.socioForm.patchValue(socio);
		this.f['cedula'].disable();
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
				detail: 'Por favor, revise los campos requeridos.',
			});
			return;
		}

		const formData = this.socioForm.getRawValue();
		let request$: Observable<Socio>;

		if (this.isEditMode && this.currentSocioId) {
			request$ = this.socioService.updateSocio(this.currentSocioId, formData);
		} else {
			const createData = { ...formData };
			delete createData.esta_activo;
			request$ = this.socioService.createSocio(createData);
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
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: err.message,
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
}
