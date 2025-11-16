import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Observable, catchError, of, tap } from 'rxjs';

// Modelos y Servicios
import { Medidor } from '../../../core/models/medidor.interface';
import { Socio } from '../../../core/models/socio.interface';
import { MedidorService } from '../../../core/services/medidor.service'; // <-- El servicio SIMULADO

// Componentes PrimeNG v20
import { TableModule, Table } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select'; // Dropdown
import { ToggleSwitchModule } from 'primeng/toggleswitch'; // Switch
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TextareaModule } from 'primeng/textarea'; // Para observaciones
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
	selector: 'amc-medidores', // Nombre del selector
	standalone: true,
	imports: [
		CommonModule,
		HttpClientModule, // Necesario para que SocioService (inyectado en MedidorService) funcione
		ReactiveFormsModule,
		// Componentes PrimeNG
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
	providers: [
		MessageService,
		ConfirmationService,
		// No proveemos MedidorService aquí porque ya está en 'root'
	],
	templateUrl: './medidores.component.html',
})
export class MedidoresComponent implements OnInit {
	// Inyección de dependencias
	private medidorService = inject(MedidorService);
	private fb = inject(FormBuilder);
	private messageService = inject(MessageService);
	private confirmationService = inject(ConfirmationService);

	// Estado del componente
	medidores: Medidor[] = [];
	socios$: Observable<Socio[]>; // Observable para el dropdown
	isLoading = true;

	// Control del Modal
	showMedidorModal = false;
	isEditMode = false;
	currentMedidorId: number | null = null;

	// Formulario
	medidorForm: FormGroup;

	constructor() {
		this.medidorForm = this.fb.group({
			socio: [null, [Validators.required]], // Guardará el objeto Socio completo
			codigo: ['', [Validators.required]],
			observacion: [''],
			tiene_medidor_fisico: [true],
			esta_activo: [true], // Solo visible en edición
		});

		// Inicializamos el observable de socios
		this.socios$ = this.medidorService.getSociosParaDropdown().pipe(
			catchError((_err) => {
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'No se pudieron cargar los socios para el formulario.',
				});
				return of([]); // Devuelve vacío si falla
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
				catchError((_err) => {
					this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar medidores.' });
					this.isLoading = false;
					return of([]);
				}),
			)
			.subscribe();
	}

	// --- MÉTODOS DEL MODAL ---

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
		this.f['socio'].enable(); // Habilita el dropdown de socio
		this.showMedidorModal = true;
	}

	openEditMedidorModal(medidor: Medidor): void {
		this.isEditMode = true;
		this.currentMedidorId = medidor.id;

		// Asigna el objeto Socio completo al dropdown
		this.medidorForm.patchValue({
			...medidor,
			socio: medidor.socio_data,
		});

		// No se puede cambiar el socio de un medidor (regla de negocio)
		this.f['socio'].disable();
		this.showMedidorModal = true;
	}

	closeMedidorModal(): void {
		this.showMedidorModal = false;
	}

	// --- MÉTODOS CRUD (Simulados) ---

	saveMedidor(): void {
		if (this.medidorForm.invalid) {
			this.medidorForm.markAllAsTouched();
			this.messageService.add({
				severity: 'warn',
				summary: 'Formulario Inválido',
				detail: 'Revise los campos requeridos.',
			});
			return;
		}

		const formData = this.medidorForm.getRawValue();

		// Preparamos los datos para el servicio (solo enviamos el ID del socio)
		const datosParaApi = {
			...formData,
			socio: formData.socio.id, // Extraemos el ID del objeto Socio
		};

		let request$: Observable<Medidor>;

		if (this.isEditMode && this.currentMedidorId) {
			request$ = this.medidorService.updateMedidor(this.currentMedidorId, datosParaApi);
		} else {
			delete datosParaApi.esta_activo; // El servicio simulado lo pone en 'true'
			request$ = this.medidorService.createMedidor(datosParaApi);
		}

		request$
			.pipe(
				tap(() => {
					this.messageService.add({
						severity: 'success',
						summary: 'Éxito',
						detail: `Medidor ${this.isEditMode ? 'actualizado' : 'creado'} (Simulación).`,
					});
					this.loadMedidores();
					this.closeMedidorModal();
				}),
				catchError((err) => {
					this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
					return of(null);
				}),
			)
			.subscribe();
	}

	deleteMedidor(id: number): void {
		this.confirmationService.confirm({
			message: '¿Está seguro de desactivar este medidor? (Simulación)',
			header: 'Confirmar Desactivación',
			icon: 'pi pi-exclamation-triangle',
			acceptLabel: 'Sí, desactivar',
			rejectLabel: 'Cancelar',
			accept: () => {
				this.medidorService
					.deleteMedidor(id)
					.pipe(
						tap(() => {
							this.messageService.add({
								severity: 'success',
								summary: 'Éxito',
								detail: 'Medidor marcado como inactivo (Simulación).',
							});
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

	// --- Helpers ---
	get f() {
		return this.medidorForm.controls;
	}

	filterGlobal(event: Event, dt: Table) {
		dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
	}
}
