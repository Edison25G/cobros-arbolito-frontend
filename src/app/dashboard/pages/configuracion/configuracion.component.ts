import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

// --- Servicios y Modelos ---
import { ConfiguracionService } from '@core/services/configuracion.service';
import { ErrorService } from '../../../auth/core/services/error.service';

// --- Imports de PrimeNG ---
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from 'primeng/inputmask'; // Para RUC/Teléfono
import { SkeletonModule } from 'primeng/skeleton';

@Component({
	selector: 'ca-configuracion',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		// --- Módulos de PrimeNG ---
		CardModule,
		ButtonModule,
		InputTextModule,
		InputNumberModule,
		InputMaskModule,
		SkeletonModule,
	],
	templateUrl: './configuracion.component.html',
	styleUrls: ['./configuracion.component.css'],
})
export class ConfiguracionComponent implements OnInit {
	// --- Inyección de Servicios ---
	private fb = inject(FormBuilder);
	private configuracionService = inject(ConfiguracionService);
	private errorService = inject(ErrorService);

	// --- Estado del Componente ---
	public configForm!: FormGroup;
	public isLoadingData = true; // Para el skeleton
	public isSaving = false; // Para el spinner del botón

	constructor() {
		// Inicializa el formulario reactivo
		this.configForm = this.fb.group({
			// Usaremos patchValue, pero es bueno definir los controles
			nombreJunta: ['', [Validators.required]],
			ruc: ['', [Validators.required]],
			direccion: ['', [Validators.required]],
			telefono: ['', [Validators.required]],
			email: ['', [Validators.required, Validators.email]],
			tarifaAguaMetroCubico: [0, [Validators.required, Validators.min(0)]],
			tarifaMoraMensual: [0, [Validators.required, Validators.min(0)]],
			valorIVA: [0, [Validators.required, Validators.min(0), Validators.max(1)]],
		});
	}

	/**
	 * ngOnInit: Se ejecuta al cargar el componente.
	 */
	ngOnInit(): void {
		this.loadConfiguracion();
	}

	/**
	 * Carga la configuración actual y la pone en el formulario
	 */
	loadConfiguracion(): void {
		this.isLoadingData = true;
		this.configuracionService.getConfiguracion().subscribe({
			next: (data) => {
				// Rellena el formulario con los datos cargados
				this.configForm.patchValue(data);
				this.isLoadingData = false;
				console.log('Configuración cargada:', data);
			},
			error: (err) => {
				console.error('Error al cargar configuración:', err);
				this.isLoadingData = false;
				this.errorService.showError('No se pudo cargar la configuración.');
			},
		});
	}

	/**
	 * Se llama al guardar los cambios del formulario
	 */
	guardarConfiguracion(): void {
		if (this.configForm.invalid) {
			this.configForm.markAllAsTouched();
			this.errorService.requiredFields();
			return;
		}

		this.isSaving = true;

		// Obtenemos los datos del formulario (incluido el 'id' si lo tuviéramos)
		const configData = this.configForm.value;

		// (En un caso real, añadiríamos el 'id' que no está en el form)
		// const payload = { ...this.configuracionCargada, ...configData };

		this.configuracionService
			.updateConfiguracion(configData) // Enviamos el objeto completo
			.pipe(
				finalize(() => {
					this.isSaving = false;
				}),
			)
			.subscribe({
				next: (response) => {
					if (response.success) {
						this.errorService.showSuccess('Configuración guardada exitosamente');
						// Rellenamos el formulario con los datos guardados (por si acaso)
						this.configForm.patchValue(response.data);
					} else {
						this.errorService.showError('No se pudo guardar la configuración.');
					}
				},
				error: (err) => {
					console.error('Error al guardar configuración:', err);
					this.errorService.showError('Error de conexión al guardar.');
				},
			});
	}
}
