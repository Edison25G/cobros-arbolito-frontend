import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Observable, catchError, of, tap } from 'rxjs';

// Modelos y Servicios
import { Medidor } from '../../../core/models/medidor.interface';
import { Socio } from '../../../core/models/socio.interface';
import { MedidorService } from '../../../core/services/medidor.service'; // ✅ Servicio REAL

// Componentes PrimeNG v20
import { TableModule, Table } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TextareaModule } from 'primeng/textarea';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
	selector: 'amc-medidores',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		TableModule,
		DialogModule,
		ButtonModule,
		InputTextModule,
		SelectModule,
		ToggleSwitchModule,
		ToastModule,
		ConfirmDialogModule,
		TagModule,
		TooltipModule,
		IconFieldModule,
		InputIconModule,
		TextareaModule,
	],
	providers: [MessageService, ConfirmationService],
	templateUrl: './medidores.component.html',
})
export class MedidoresComponent implements OnInit {
	// Inyecciones
	private medidorService = inject(MedidorService);
	private fb = inject(FormBuilder);
	private messageService = inject(MessageService);
	private confirmationService = inject(ConfirmationService);

	// Estado
	medidores: Medidor[] = [];
	socios$: Observable<Socio[]>;
	isLoading = true;

	// Modal
	showMedidorModal = false;
	isEditMode = false;
	currentMedidorId: number | null = null;

	// Formulario
	medidorForm: FormGroup;

	constructor() {
		this.medidorForm = this.fb.group({
			socio: [null, [Validators.required]], // Guardará el Objeto Socio completo (para el dropdown)
			codigo: ['', [Validators.required]],
			observacion: [''],
			tiene_medidor_fisico: [true],
			esta_activo: [true],
		});

		// Cargar socios para el Dropdown
		this.socios$ = this.medidorService.getSociosParaDropdown().pipe(
			catchError(() => {
				this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se cargaron los socios.' });
				return of([]);
			}),
		);
	}

	ngOnInit(): void {
		this.loadMedidores();
	}

	loadMedidores(): void {
		this.isLoading = true;
		this.medidorService
			.getMedidores()
			.pipe(
				tap((data) => {
					this.medidores = data;
					this.isLoading = false;
				}),
				catchError(() => {
					this.isLoading = false;
					// El servicio ya maneja el error por consola, aquí solo notificamos visualmente si quieres
					return of([]);
				}),
			)
			.subscribe();
	}

	// --- MODAL ---

	openNewMedidorModal(): void {
		this.isEditMode = false;
		this.currentMedidorId = null;
		this.medidorForm.reset({
			socio: null,
			codigo: '',
			observacion: '',
			tiene_medidor_fisico: true,
			esta_activo: true,
		});
		this.f['socio'].enable();
		this.showMedidorModal = true;
	}

	openEditMedidorModal(medidor: Medidor): void {
		this.isEditMode = true;
		this.currentMedidorId = medidor.id;

		// ✅ CORRECCIÓN CLAVE:
		// El formulario espera un objeto Socio en el campo 'socio'.
		// Gracias al forkJoin del servicio, tenemos 'medidor.socio_data'.
		this.medidorForm.patchValue({
			codigo: medidor.codigo,
			observacion: medidor.observacion,
			tiene_medidor_fisico: medidor.tiene_medidor_fisico,
			esta_activo: medidor.esta_activo,
			socio: medidor.socio_data, // Asignamos el objeto socio completo al dropdown
		});

		this.f['socio'].disable(); // No permitimos cambiar de dueño en edición
		this.showMedidorModal = true;
	}

	closeMedidorModal(): void {
		this.showMedidorModal = false;
	}

	// --- CRUD REAL ---

	saveMedidor(): void {
		if (this.medidorForm.invalid) {
			this.medidorForm.markAllAsTouched();
			this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Revise los campos requeridos.' });
			return;
		}

		const formData = this.medidorForm.getRawValue();

		// ✅ MAPEO PARA EL BACKEND (Django espera socio_id)
		const datosParaApi = {
			codigo: formData.codigo,
			observacion: formData.observacion,
			tiene_medidor_fisico: formData.tiene_medidor_fisico,
			esta_activo: formData.esta_activo,
			socio_id: formData.socio.id, // Extraemos solo el ID del objeto socio seleccionado
		};

		let request$: Observable<Medidor>;

		if (this.isEditMode && this.currentMedidorId) {
			request$ = this.medidorService.updateMedidor(this.currentMedidorId, datosParaApi);
		} else {
			// Al crear, Django suele poner esta_activo=True por defecto, pero enviarlo no daña nada
			request$ = this.medidorService.createMedidor(datosParaApi);
		}

		request$
			.pipe(
				tap(() => {
					this.messageService.add({
						severity: 'success',
						summary: 'Éxito',
						detail: `Medidor ${this.isEditMode ? 'actualizado' : 'creado'} correctamente.`,
					});
					this.loadMedidores(); // Recargar tabla
					this.closeMedidorModal();
				}),
				catchError((err) => {
					// Mostramos el mensaje de error que configuramos en el servicio (handleError)
					this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
					return of(null);
				}),
			)
			.subscribe();
	}

	deleteMedidor(id: number): void {
		this.confirmationService.confirm({
			message:
				'¿Está seguro de eliminar este medidor? Esta acción podría no ser reversible si tiene lecturas asociadas.',
			header: 'Confirmar Eliminación',
			icon: 'pi pi-exclamation-triangle',
			acceptLabel: 'Sí, eliminar',
			rejectLabel: 'Cancelar',
			accept: () => {
				this.medidorService
					.deleteMedidor(id)
					.pipe(
						tap(() => {
							this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Medidor eliminado.' });
							this.loadMedidores();
						}),
						catchError((err) => {
							this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
							return of(null);
						}),
					)
					.subscribe();
			},
		});
	}

	// Helpers
	get f() {
		return this.medidorForm.controls;
	}

	filterGlobal(event: Event, dt: Table) {
		dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
	}
}
