import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

// Modelos y Servicios
import { Medidor } from '../../../core/models/medidor.interface';
import { RegistrarLecturaDTO } from '../../../core/models/lectura.interface';
import { MedidorService } from '../../../core/services/medidor.service';
import { LecturaService } from '../../../core/services/lectura.service';
import { ErrorService } from '../../../auth/core/services/error.service';

// Componentes PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

@Component({
	selector: 'amc-lecturas',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		RouterModule,
		ButtonModule,
		InputNumberModule,
		SelectModule,
		DatePickerModule,
		ToastModule,
		TooltipModule,
	],
	providers: [MessageService, DatePipe],
	templateUrl: './lecturas.component.html',
})
export class LecturasComponent implements OnInit {
	private fb = inject(FormBuilder);
	private medidorService = inject(MedidorService);
	private lecturaService = inject(LecturaService);
	private errorService = inject(ErrorService);
	private router = inject(Router);

	lecturaForm: FormGroup;
	isLoading = false;

	// Listas de datos
	todosLosMedidores: Medidor[] = []; // Copia completa de la BD
	medidoresFiltrados: Medidor[] = []; // Lo que se muestra en el dropdown
	barrios: any[] = []; // Lista de barrios para el filtro

	constructor() {
		this.lecturaForm = this.fb.group({
			barrio: [null], // Nuevo campo para el filtro (no es requerido para enviar, solo para filtrar)
			medidor: [null, [Validators.required]],
			lectura_actual_m3: [null, [Validators.required, Validators.min(0)]],
			fecha_lectura: [new Date(), [Validators.required]],
		});
	}

	ngOnInit(): void {
		this.cargarDatosIniciales();

		// Escuchamos cambios en el selector de Barrio
		this.lecturaForm.get('barrio')?.valueChanges.subscribe((barrioSeleccionado) => {
			this.filtrarMedidores(barrioSeleccionado);
		});
	}

	cargarDatosIniciales() {
		// Obtenemos todos los medidores físicos
		this.medidorService.getMedidores().subscribe({
			next: (data) => {
				// 1. Guardamos solo los que tienen medidor físico
				this.todosLosMedidores = data.filter((m) => m.tiene_medidor_fisico);

				// 2. Inicialmente mostramos todos en el dropdown
				this.medidoresFiltrados = this.todosLosMedidores;

				// 3. Extraer lista única de barrios para el filtro
				// Usamos un Set para eliminar duplicados automáticamente
				const barriosUnicos = [...new Set(this.todosLosMedidores.map((m) => m.socio_data?.barrio).filter((b) => !!b))];

				// Formateamos para PrimeNG ({label, value})
				this.barrios = barriosUnicos
					.map((b) => ({ label: b, value: b }))
					.sort((a, b) => a.label!.localeCompare(b.label!));
			},
			error: (err) => {
				this.errorService.showError('No se pudieron cargar los medidores.');
				console.error(err);
			},
		});
	}

	filtrarMedidores(barrio: string | null) {
		// Limpiamos la selección anterior para evitar errores (medidor de otro barrio)
		this.lecturaForm.patchValue({ medidor: null });

		if (!barrio) {
			// Si borran el filtro, mostramos todos
			this.medidoresFiltrados = this.todosLosMedidores;
		} else {
			// Filtramos por el nombre del barrio del socio
			this.medidoresFiltrados = this.todosLosMedidores.filter((m) => m.socio_data?.barrio === barrio);
		}
	}

	get f() {
		return this.lecturaForm.controls;
	}

	onSubmit(): void {
		if (this.lecturaForm.invalid) {
			this.lecturaForm.markAllAsTouched();
			this.errorService.requiredFields();
			return;
		}

		this.isLoading = true;
		const formData = this.lecturaForm.value;

		const fecha = new Date(formData.fecha_lectura);
		const fechaISO =
			fecha.getFullYear() +
			'-' +
			String(fecha.getMonth() + 1).padStart(2, '0') +
			'-' +
			String(fecha.getDate()).padStart(2, '0');

		const user = JSON.parse(localStorage.getItem('user') || '{}');
		const operadorId = user.id && user.id > 0 ? user.id : 1;

		const dto: RegistrarLecturaDTO = {
			medidor_id: formData.medidor.id,
			lectura_actual_m3: formData.lectura_actual_m3,
			fecha_lectura: fechaISO,
			operador_id: operadorId,
		};

		this.lecturaService
			.registrarLectura(dto)
			.pipe(finalize(() => (this.isLoading = false)))
			.subscribe({
				next: (response) => {
					this.errorService.showSuccess(`Lectura registrada. Consumo: ${response.consumo_del_mes} m³`);

					// Reseteamos el formulario, pero mantenemos el barrio y la fecha para agilizar el siguiente registro
					const barrioActual = this.lecturaForm.get('barrio')?.value;
					this.lecturaForm.reset({
						barrio: barrioActual,
						fecha_lectura: new Date(),
					});
				},
				error: (err) => {
					// El errorService ya muestra el mensaje en el catchError del servicio,
					// pero si el servicio propaga el error, lo atrapamos aquí.
					if (err.message) this.errorService.showError(err.message);
				},
			});
	}
}
