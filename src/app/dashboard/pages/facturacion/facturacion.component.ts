import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

// --- Servicios y Modelos ---
import { FacturacionService } from '@core/services/facturacion.service';
import { Factura } from '@core/models/factura.interface';
import { ErrorService } from '../../../auth/core/services/error.service';

// --- Imports de PrimeNG ---
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker'; // Para el selector de mes

@Component({
	selector: 'amc-facturacion',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		// --- Módulos de PrimeNG ---
		CardModule,
		ButtonModule,
		TableModule,
		TagModule,
		TooltipModule,
		DatePickerModule,
	],
	templateUrl: './facturacion.component.html',
	styleUrls: ['./facturacion.component.css'],
})
export class FacturacionComponent implements OnInit {
	// --- Inyección de Servicios ---
	private fb = inject(FormBuilder);
	private facturacionService = inject(FacturacionService);
	private errorService = inject(ErrorService);

	// --- Estado del Componente ---
	public facturacionForm!: FormGroup;
	public facturas: Factura[] = [];
	public isLoadingTable = true; // Spinner para la tabla
	public isGenerating = false; // Spinner para el botón de generar

	constructor() {
		// Formulario para seleccionar el mes a facturar
		this.facturacionForm = this.fb.group({
			// Usaremos un DatePicker en modo "month"
			mesAnio: [new Date(), [Validators.required]],
		});
	}

	/**
	 * ngOnInit: Se ejecuta al cargar el componente.
	 */
	ngOnInit(): void {
		this.loadFacturas();
	}

	/**
	 * Llama al servicio para cargar la lista de facturas
	 */
	loadFacturas(): void {
		this.isLoadingTable = true;
		this.facturacionService.getFacturas().subscribe({
			next: (data) => {
				this.facturas = data;
				this.isLoadingTable = false;
			},
			error: (err) => {
				console.error('Error al cargar facturas:', err);
				this.isLoadingTable = false;
				this.errorService.showError('No se pudieron cargar las facturas.');
			},
		});
	}

	/**
	 * Se llama al hacer clic en "Generar Facturación"
	 */
	generarFacturacion(): void {
		if (this.facturacionForm.invalid) {
			this.errorService.requiredFields();
			return;
		}

		this.isGenerating = true;
		const fecha: Date = this.facturacionForm.value.mesAnio;

		// Preparamos el payload (Mes es 0-indexado, por eso +1)
		const payload = {
			mes: fecha.getMonth() + 1,
			anio: fecha.getFullYear(),
		};

		this.facturacionService
			.generarFacturacion(payload)
			.pipe(
				finalize(() => {
					this.isGenerating = false;
				}),
			)
			.subscribe({
				next: (response) => {
					if (response.success) {
						this.errorService.showSuccess(response.message);
						// ¡Importante! Recargamos la tabla para ver las nuevas facturas
						this.loadFacturas();
					} else {
						this.errorService.showError(response.message);
					}
				},
				error: (err) => {
					console.error('Error al generar facturación:', err);
					this.errorService.showError('Error de conexión al generar.');
				},
			});
	}
}
