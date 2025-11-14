import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

// --- Servicios y Modelos ---
import { SocioService } from '@core/services/socio.service';
import { FacturacionService } from '@core/services/facturacion.service';
import { PagoService } from '@core/services/pago.service';
import { ErrorService } from '../../../auth/core/services/error.service';
import { Socio } from '@core/models/socio.interface';
import { Factura } from '@core/models/factura.interface';
import { MetodoPago } from '@core/models/pago.interface';

// --- Imports de PrimeNG ---
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select'; // p-select
import { DatePickerModule } from 'primeng/datepicker'; // p-datepicker
import { InputNumberModule } from 'primeng/inputnumber'; // p-inputNumber

@Component({
	selector: 'amc-pagos-registro',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		// --- Módulos de PrimeNG ---
		CardModule,
		ButtonModule,
		SelectModule,
		DatePickerModule,
		InputNumberModule,
	],
	templateUrl: './pagos-registro.component.html',
	styleUrls: ['./pagos-registro.component.css'],
})
export class PagosRegistroComponent implements OnInit {
	// --- Inyección de Servicios ---
	private fb = inject(FormBuilder);
	private socioService = inject(SocioService);
	private facturacionService = inject(FacturacionService);
	private pagoService = inject(PagoService);
	private errorService = inject(ErrorService);

	// --- Estado del Componente ---
	public pagoForm!: FormGroup;
	public isLoadingSocios = true;
	public isLoadingFacturas = false; // Spinner para el 2do dropdown
	public isSaving = false;

	// --- Datos para Dropdowns ---
	public sociosDropdown: any[] = [];
	public facturasDropdown: any[] = [];
	public metodosPagoDropdown: any[] = [
		{ label: 'Efectivo', value: MetodoPago.Efectivo },
		{ label: 'Transferencia', value: MetodoPago.Transferencia },
		{ label: 'Otro', value: MetodoPago.Otro },
	];

	constructor() {
		this.pagoForm = this.fb.group({
			socio: [null, [Validators.required]],
			factura: [{ value: null, disabled: true }, [Validators.required]], // Deshabilitado al inicio
			monto: [{ value: null, disabled: true }, [Validators.required]], // Deshabilitado al inicio
			metodoPago: [MetodoPago.Efectivo, [Validators.required]],
			fechaPago: [new Date(), [Validators.required]],
		});
	}

	ngOnInit(): void {
		this.loadSociosDropdown();
	}

	/**
	 * Carga la lista inicial de todos los socios
	 */
	loadSociosDropdown(): void {
		this.isLoadingSocios = true;
		this.socioService.getSocios().subscribe({
			next: (data) => {
				this.sociosDropdown = data.map((socio: Socio) => ({
					label: `${socio.nombre} ${socio.apellido} (${socio.cedula})`,
					value: socio, // Guardamos el objeto 'Socio' completo
				}));
				this.isLoadingSocios = false;
			},
			error: (_err) => {
				this.isLoadingSocios = false;
				this.errorService.showError('No se pudieron cargar los socios.');
			},
		});
	}

	/**
	 * EVENTO: Se llama cuando el usuario SELECCIONA un socio
	 */
	onSocioChange(): void {
		const socioSeleccionado: Socio | null = this.pagoForm.get('socio')?.value;

		// Limpia los campos dependientes
		this.pagoForm.get('factura')?.reset();
		this.pagoForm.get('monto')?.reset();
		this.facturasDropdown = [];

		if (socioSeleccionado) {
			this.isLoadingFacturas = true;
			this.pagoForm.get('factura')?.enable(); // Habilita el dropdown de facturas

			// Llama al servicio para buscar facturas de ESE socio
			this.facturacionService.getFacturasPendientesPorSocio(socioSeleccionado.id).subscribe({
				next: (facturas) => {
					this.facturasDropdown = facturas.map((factura: Factura) => ({
						label: `${factura.numeroFactura} - $${factura.total} (Vence: ${new Date(factura.fechaVencimiento).toLocaleDateString()})`,
						value: factura, // Guardamos el objeto 'Factura' completo
					}));
					this.isLoadingFacturas = false;
				},
				error: (_err) => {
					this.isLoadingFacturas = false;
					this.errorService.showError('Error al cargar facturas del socio.');
				},
			});
		} else {
			this.pagoForm.get('factura')?.disable();
		}
	}

	/**
	 * EVENTO: Se llama cuando el usuario SELECCIONA una factura
	 */
	onFacturaChange(): void {
		const facturaSeleccionada: Factura | null = this.pagoForm.get('factura')?.value;

		if (facturaSeleccionada) {
			// Auto-rellena el campo de monto y lo habilita
			this.pagoForm.get('monto')?.setValue(facturaSeleccionada.total);
			this.pagoForm.get('monto')?.enable();
		} else {
			this.pagoForm.get('monto')?.reset();
			this.pagoForm.get('monto')?.disable();
		}
	}

	/**
	 * Se llama al enviar el formulario de PAGO
	 */
	registrarPago(): void {
		if (this.pagoForm.invalid) {
			this.pagoForm.markAllAsTouched();
			this.errorService.requiredFields();
			return;
		}

		this.isSaving = true;
		const formValue = this.pagoForm.value;

		const payload = {
			idFactura: formValue.factura.id, // Sacamos el ID de la factura
			montoPagado: formValue.monto,
			metodoPago: formValue.metodoPago,
			fechaPago: formValue.fechaPago,
		};

		this.pagoService
			.registrarPago(payload)
			.pipe(
				finalize(() => {
					this.isSaving = false;
				}),
			)
			.subscribe({
				next: (response) => {
					if (response.success) {
						this.errorService.showSuccess(response.message);
						// Resetea el formulario completo
						this.pagoForm.reset({
							socio: null,
							factura: { value: null, disabled: true },
							monto: { value: null, disabled: true },
							metodoPago: MetodoPago.Efectivo,
							fechaPago: new Date(),
						});
						this.facturasDropdown = []; // Limpia el dropdown de facturas
					} else {
						this.errorService.showError(response.message);
					}
				},
				error: (_err) => {
					this.errorService.showError('Error de conexión al guardar el pago.');
				},
			});
	}
}
