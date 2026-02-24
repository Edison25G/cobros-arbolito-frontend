import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';

import { FacturacionService } from '../../../core/services/facturacion.service';
import { LecturaPendiente } from '../../../core/interfaces/factura.interface';

@Component({
	selector: 'app-facturacion',
	standalone: true,
	imports: [CommonModule, FormsModule, TableModule, ButtonModule, ToastModule, DatePickerModule],
	providers: [MessageService],
	templateUrl: './facturacion.component.html',
})
export class FacturacionComponent implements OnInit {
	private messageService = inject(MessageService);
	private facturacionService = inject(FacturacionService);

	fechaEmision: Date = new Date();
	lecturasPendientes: LecturaPendiente[] = [];

	isLoading = false;
	isProcessing = false;

	// KPIs
	totalPlanillasMedidor = 0;
	totalAgua = 0;
	totalMultas = 0;
	granTotal = 0;

	ngOnInit() {
		this.buscarPreEmision(); // ✅ Nombre corregido
	}

	/**
	 * ✅ CORREGIDO: Llama a PRE-EMISIÓN (Lecturas listas para cobrar)
	 * Ya no enviamos mes/anio porque trae TODO lo que está "Registrado" pero no "Facturado".
	 */
	buscarPreEmision() {
		this.isLoading = true;

		this.facturacionService.getPreEmision().subscribe({
			next: (data) => {
				this.lecturasPendientes = data;
				this.calcularResumen();
				this.isLoading = false;
			},
			error: (err) => {
				this.isLoading = false;
				console.error(err);
				this.lecturasPendientes = [];
			},
		});
	}

	calcularResumen() {
		this.totalPlanillasMedidor = this.lecturasPendientes.length;
		this.totalAgua = this.lecturasPendientes.reduce((acc, item) => acc + (item.monto_agua || 0), 0);
		this.totalMultas = 0;

		// Sumamos visualmente las acometidas fijas ($3.00 c/u) si quisieras,
		// pero por ahora nos centramos en que aparezca Edison.
		this.granTotal = this.totalAgua + this.totalMultas;
	}

	generarEmisionMasiva() {
		this.isProcessing = true;

		if (!this.lecturasPendientes || this.lecturasPendientes.length === 0) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Sin datos',
				detail: 'No hay lecturas para facturar.',
			});
			this.isProcessing = false;
			return;
		}

		// 🔥 ENVIAMOS EXACTAMENTE LO QUE DEVUELVE PRE-EMISION
		this.facturacionService.generarEmisionMasiva(this.lecturasPendientes).subscribe({
			next: () => {
				this.messageService.add({
					severity: 'success',
					summary: 'Éxito',
					detail: 'Facturas generadas correctamente.',
				});
				this.buscarPreEmision();
				this.isProcessing = false;
			},
			error: (err) => {
				this.isProcessing = false;
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: err.message,
				});
			},
		});
	}
}
