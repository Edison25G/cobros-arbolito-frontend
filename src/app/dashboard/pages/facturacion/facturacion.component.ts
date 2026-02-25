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
	lecturasPendientes: LecturaPendiente[] = []; // ✅ ¡Interfaz activa y segura!

	isLoading = false;
	isProcessing = false;

	totalPlanillasMedidor = 0;
	totalAgua = 0;
	totalMultas = 0;
	granTotal = 0;

	ngOnInit() {
		this.buscarPreEmision();
	}

	buscarPreEmision() {
		this.isLoading = true;
		this.facturacionService.getPreEmision().subscribe({
			next: (data: LecturaPendiente[]) => {
				this.lecturasPendientes = data;
				this.calcularResumen();
				this.isLoading = false;
			},
			error: (_err) => {
				this.isLoading = false;
				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: 'No se pudieron cargar los datos pendientes.',
				});
			},
		});
	}

	calcularResumen() {
		this.totalPlanillasMedidor = this.lecturasPendientes.length;

		// Sumamos usando el subtotal o valor_agua según lo que definieron
		this.totalAgua = this.lecturasPendientes.reduce((acc, item) => acc + (item.subtotal || 0), 0);
		this.totalMultas = this.lecturasPendientes.reduce((acc, item) => acc + (item.multas_mingas || 0), 0);
		this.granTotal = this.totalAgua + this.totalMultas;
	}

	generarEmisionMasiva() {
		if (!this.lecturasPendientes.length) return;
		this.isProcessing = true;

		this.facturacionService.generarEmisionMasiva(this.lecturasPendientes).subscribe({
			next: (res: any) => {
				// Ahora siempre entrará aquí aunque mandes duplicados,
				// porque el back ya los maneja.
				this.messageService.add({
					severity: 'success',
					summary: 'Proceso Completado',
					detail: res.mensaje || 'Las facturas pendientes han sido procesadas.',
					life: 3000,
				});
				this.finalizarProceso();
			},
			error: (err) => {
				this.isProcessing = false;
				// Si llega a entrar aquí, es por un error real de servidor (caída de DB, etc.)
				this.messageService.add({
					severity: 'error',
					summary: 'Error Crítico',
					detail: err.error?.detalle || 'Error inesperado en el servidor.',
					life: 5000,
				});
				console.error('TRACEBACK:', err.error?.traceback);
			},
		});
	}

	/**
	 * Limpia los datos de la interfaz y refresca la lista desde el servidor
	 */
	private finalizarProceso() {
		this.lecturasPendientes = [];
		this.totalPlanillasMedidor = 0;
		this.totalAgua = 0;
		this.granTotal = 0;
		this.isProcessing = false;

		// Volvemos a consultar para traer solo lo que realmente falta por facturar
		this.buscarPreEmision();
	}
}
