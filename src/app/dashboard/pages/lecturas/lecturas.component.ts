import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Observable, catchError, of, tap, map } from 'rxjs'; // <-- 1. IMPORTAR 'map' DE RxJS

// Modelos y Servicios
import { Medidor } from '../../../core/models/medidor.interface';
import { RegistrarLecturaDTO } from '../../../core/models/lectura.interface';
import { MedidorService } from '../../../core/services/medidor.service'; // (Simulado)
import { LecturaService } from '../../../core/services/lectura.service'; // (Real)

// 2. Importar tu ErrorService con la ruta correcta
import { ErrorService } from '../../../auth/core/services/error.service';

// Componentes PrimeNG v20
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api'; // Necesario para que ErrorService funcione

@Component({
	selector: 'amc-lecturas',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		// Componentes PrimeNG
		ButtonModule,
		InputNumberModule,
		SelectModule,
		DatePickerModule,
		ToastModule, // <-- Se mantiene, ya que ErrorService lo usa internamente
	],
	providers: [
		MessageService, // <-- Se mantiene, ya. que ErrorService lo inyecta
	],
	templateUrl: './lecturas.component.html',
})
export class LecturasComponent implements OnInit {
	// Inyección de dependencias
	private fb = inject(FormBuilder);
	private medidorService = inject(MedidorService);
	private lecturaService = inject(LecturaService);
	private errorService = inject(ErrorService); // <-- 3. Inyectar ErrorService

	lecturaForm: FormGroup;
	medidores$: Observable<Medidor[]>;
	isLoading = false;

	constructor() {
		this.lecturaForm = this.fb.group({
			medidor: [null, [Validators.required]],
			lectura_actual_m3: [null, [Validators.required, Validators.min(0)]],
			fecha_lectura: [new Date(), [Validators.required]],
		});

		this.medidores$ = this.medidorService.getMedidores().pipe(
			// 4. Se añade el TIPO para corregir el error de 'any'
			map((medidores: Medidor[]) => medidores.filter((m) => m.tiene_medidor_fisico)),
			catchError((err) => {
				// 5. Se llama al método CORRECTO 'showError' de tu ErrorService
				this.errorService.showError('No se pudieron cargar los medidores.');
				console.error(err); // Dejamos el log para depuración
				return of([]);
			}),
		);
	}

	ngOnInit(): void {
		// Se realiza una suscripción puntual para forzar la carga inicial de medidores
		// (la fuente es un Observable de HTTP y se completa tras la respuesta).
		this.medidores$.subscribe({
			next: () => {
				// Carga exitosa; los efectos (errores/filtrado) ya se manejan en el pipe.
			},
			error: () => {
				// Manejo defensivo: el catchError del pipe ya notifica mediante ErrorService.
			},
		});
	}

	get f() {
		return this.lecturaForm.controls;
	}

	onSubmit(): void {
		if (this.lecturaForm.invalid) {
			this.lecturaForm.markAllAsTouched();
			// 7. Usamos tu ErrorService para mensajes de validación
			this.errorService.requiredFields();
			return;
		}

		this.isLoading = true;
		const formData = this.lecturaForm.value;

		const fecha = new Date(formData.fecha_lectura);
		const fechaISO = fecha.toISOString().split('T')[0];

		const dto: RegistrarLecturaDTO = {
			medidor_id: formData.medidor.id,
			lectura_actual_m3: formData.lectura_actual_m3,
			fecha_lectura: fechaISO,
			operador_id: 1, // (Dato quemado - pendiente de reemplazar por el ID del usuario logueado)
		};

		this.lecturaService
			.registrarLectura(dto)
			.pipe(
				tap((response) => {
					this.isLoading = false;
					// 8. Usamos 'showSuccess' de tu ErrorService
					this.errorService.showSuccess(`Éxito. Consumo del mes: ${response.consumo_del_mes} m³`);

					this.lecturaForm.reset({
						fecha_lectura: formData.fecha_lectura,
					});
				}),
				catchError((err) => {
					this.isLoading = false;
					// 9. Usamos 'showError' de tu ErrorService
					this.errorService.showError(err.message);
					return of(null);
				}),
			)
			.subscribe();
	}
}
