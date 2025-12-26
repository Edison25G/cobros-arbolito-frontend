import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

// Servicios
import { FacturacionService } from '../../../core/services/facturacion.service';
import { LecturaPendiente } from '../../../core/interfaces/factura.interface';

@Component({
	selector: 'app-facturacion',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		TableModule,
		ButtonModule,
		ToastModule,
		DatePickerModule,
		CardModule,
		TagModule,
		TooltipModule,
	],
	providers: [MessageService],
	templateUrl: './facturacion.component.html',
})
export class FacturacionComponent implements OnInit {
	private messageService = inject(MessageService);
	private facturacionService = inject(FacturacionService);

	fechaEmision: Date = new Date(); // Por defecto hoy
	lecturasPendientes: LecturaPendiente[] = [];

	isLoading = false;
	isProcessing = false;

	// KPIs
	totalPlanillas = 0;
	totalAgua = 0;
	totalMultas = 0;
	granTotal = 0;

	ngOnInit() {
		this.buscarPendientes();
	}

	/**
	 * Llama al backend para ver qué lecturas faltan por cobrar en ese mes
	 */
	buscarPendientes() {
		this.isLoading = true;

		// OJO: getMonth() devuelve 0 para Enero, por eso sumamos +1
		const mes = this.fechaEmision.getMonth() + 1;
		const anio = this.fechaEmision.getFullYear();

		this.facturacionService.getPendientes(mes, anio).subscribe({
			next: (data) => {
				this.lecturasPendientes = data;
				this.calcularResumen();
				this.isLoading = false;
			},
			error: (_err) => {
				this.isLoading = false;
				this.lecturasPendientes = []; // Limpiamos si hay error
				this.calcularResumen();
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'No se pudieron cargar las lecturas pendientes.',
				});
			},
		});
	}

	calcularResumen() {
		this.totalPlanillas = this.lecturasPendientes.length;
		this.totalAgua = this.lecturasPendientes.reduce((acc, item) => acc + (Number(item.monto_agua) || 0), 0);
		this.totalMultas = this.lecturasPendientes.reduce((acc, item) => acc + (Number(item.multas_mingas) || 0), 0);
		this.granTotal = this.totalAgua + this.totalMultas;
	}

	/**
	 * Botón Verde: Manda a crear las facturas realmente en la BD
	 */
	generarEmisionMasiva() {
		if (this.totalPlanillas === 0) return;

		this.isProcessing = true;
		const mes = this.fechaEmision.getMonth() + 1;
		const anio = this.fechaEmision.getFullYear();

		// ID quemado del tesorero (esto luego lo sacarás del login real)
		const usuarioId = 1;

		this.facturacionService.generarEmisionMasiva({ mes, anio, usuario_id: usuarioId }).subscribe({
			next: (resp) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Emisión Exitosa',
					detail: resp.mensaje || 'Se han generado las facturas correctamente.',
				});

				// Refrescamos la tabla (debería quedar vacía porque ya no están pendientes)
				this.buscarPendientes();
				this.isProcessing = false;
			},
			error: (err) => {
				this.isProcessing = false;
				this.messageService.add({
					severity: 'error',
					summary: 'Error de Emisión',
					detail: err.message,
				});
			},
		});
	}
}
