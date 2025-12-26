import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from 'primeng/inputmask';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Servicios
import { ConfiguracionService } from '../../../core/services/configuracion.service';
// import { ErrorService } from ... (Si tienes tu servicio de errores personalizado, úsalo)

@Component({
	selector: 'app-configuracion',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		CardModule,
		ButtonModule,
		InputTextModule,
		InputNumberModule,
		InputMaskModule,
		SkeletonModule,
		ToastModule,
	],
	providers: [MessageService], // Proveedor local para el Toast
	templateUrl: './configuracion.component.html',
})
export class ConfiguracionComponent implements OnInit {
	private fb = inject(FormBuilder);
	private configuracionService = inject(ConfiguracionService);
	private messageService = inject(MessageService);

	configForm: FormGroup;
	isLoadingData = true;
	isSaving = false;

	constructor() {
		this.configForm = this.fb.group({
			// Validaciones robustas
			nombreJunta: ['', [Validators.required, Validators.minLength(5)]],
			ruc: ['', [Validators.required]], // InputMask se encarga de la longitud
			direccion: ['', [Validators.required]],
			telefono: ['', [Validators.required]],
			email: ['', [Validators.required, Validators.email]],
			tarifaAguaMetroCubico: [0, [Validators.required, Validators.min(0)]],
			tarifaMoraMensual: [0, [Validators.required, Validators.min(0)]],
			valorIVA: [0, [Validators.required, Validators.min(0), Validators.max(1)]],
		});
	}

	ngOnInit(): void {
		this.loadConfiguracion();
	}

	loadConfiguracion(): void {
		this.isLoadingData = true;
		this.configuracionService.getConfiguracion().subscribe({
			next: (data) => {
				this.configForm.patchValue(data);
				this.isLoadingData = false;
			},
			error: (err) => {
				console.error(err);
				this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la configuración.' });
				this.isLoadingData = false;
			},
		});
	}

	guardarConfiguracion(): void {
		if (this.configForm.invalid) {
			this.configForm.markAllAsTouched();
			this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Revisa los campos obligatorios.' });
			return;
		}

		this.isSaving = true;
		const configData = this.configForm.value;

		this.configuracionService
			.updateConfiguracion(configData)
			.pipe(finalize(() => (this.isSaving = false)))
			.subscribe({
				next: (data) => {
					this.messageService.add({
						severity: 'success',
						summary: 'Éxito',
						detail: 'Configuración actualizada correctamente.',
					});
					this.configForm.patchValue(data); // Actualizamos con lo que devolvió el server
				},
				error: (err) => {
					console.error(err);
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'No se pudieron guardar los cambios.',
					});
				},
			});
	}
}
