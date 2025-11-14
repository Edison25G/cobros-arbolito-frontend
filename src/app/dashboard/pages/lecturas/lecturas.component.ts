import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

// --- Servicios y Modelos ---
import { LecturaService } from '@core/services/lectura.service';
import { SocioService } from '@core/services/socio.service';
import { Socio } from '@core/models/socio.interface';
import { ErrorService } from '../../../auth/core/services/error.service';

// --- Imports de PrimeNG (CORREGIDOS PARA V20) ---
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select'; // <-- DropdownModule está aquí
import { DatePickerModule } from 'primeng/datepicker'; // <-- CalendarModule está aquí
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
	selector: 'amc-lecturas', // Usando prefijo 'amc-'
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		// --- Módulos de PrimeNG ---
		CardModule,
		ButtonModule,
		InputNumberModule,
		SelectModule, // <-- CORREGIDO
		DatePickerModule, // <-- CORREGIDO
		ProgressSpinnerModule,
	],
	templateUrl: './lecturas.component.html',
	styleUrls: ['./lecturas.component.css'],
})
// Quitamos el 'default' para evitar el NG1010
export class LecturasComponent implements OnInit {
	// --- Inyección de Servicios ---
	private fb = inject(FormBuilder);
	private socioService = inject(SocioService);
	private lecturaService = inject(LecturaService);
	private errorService = inject(ErrorService);

	// --- Estado del Componente ---
	public lecturaForm!: FormGroup;
	public isLoadingSocios = true;
	public isSaving = false;

	// --- Datos ---
	public sociosDropdown: any[] = [];
	public maxDate = new Date();

	constructor() {
		this.lecturaForm = this.fb.group({
			socio: [null, [Validators.required]],
			valorLectura: [null, [Validators.required, Validators.min(1)]],
			fechaLectura: [new Date(), [Validators.required]],
		});
	}

	ngOnInit(): void {
		this.loadSociosDropdown();
	}

	loadSociosDropdown(): void {
		this.isLoadingSocios = true;
		this.socioService.getSocios().subscribe({
			next: (data) => {
				this.sociosDropdown = data.map((socio: Socio) => ({
					label: `${socio.nombre} ${socio.apellido} (${socio.cedula})`,
					value: socio,
				}));
				this.isLoadingSocios = false;
			},
			error: (err) => {
				console.error('Error al cargar socios:', err);
				this.isLoadingSocios = false;
				this.errorService.showError('No se pudieron cargar los socios.');
			},
		});
	}

	registrarLectura(): void {
		if (this.lecturaForm.invalid) {
			this.lecturaForm.markAllAsTouched();
			this.errorService.requiredFields();
			return;
		}

		this.isSaving = true;
		const formValue = this.lecturaForm.value;

		const payload = {
			idSocio: formValue.socio.id,
			valorLectura: formValue.valorLectura,
			fechaLectura: formValue.fechaLectura,
		};

		this.lecturaService
			.registrarLectura(payload)
			.pipe(
				finalize(() => {
					this.isSaving = false;
				}),
			)
			.subscribe({
				next: (response) => {
					if (response.success) {
						this.errorService.showSuccess(response.message);
						this.lecturaForm.reset();
						this.lecturaForm.patchValue({ fechaLectura: new Date() });
					} else {
						this.errorService.showError(response.message);
					}
				},
				error: (err) => {
					console.error('Error al registrar lectura:', err);
					this.errorService.showError('Error de conexión al guardar.');
				},
			});
	}
}
