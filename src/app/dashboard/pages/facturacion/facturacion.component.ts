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
		this.totalMultas = 0;
		this.granTotal = this.totalAgua + this.totalMultas;
	}

	generarEmisionMasiva() {
		if (!this.lecturasPendientes.length) return;

		this.isProcessing = true;

		this.facturacionService.generarEmisionMasiva(this.lecturasPendientes).subscribe({
			next: (res: any) => {
				this.messageService.add({
					severity: 'success',
					summary: 'Completado',
					detail: res.mensaje || 'Facturas generadas con éxito.',
				});

				// ✅ LIMPIEZA TOTAL POST-GENERACIÓN
				this.lecturasPendientes = [];
				this.totalPlanillasMedidor = 0;
				this.totalAgua = 0;
				this.granTotal = 0;

				// Refrescamos para confirmar que ya no hay nada en el Back
				this.buscarPreEmision();
				this.isProcessing = false;
			},
			error: (err) => {
				this.isProcessing = false;
				this.messageService.add({
					severity: 'error',
					summary: 'Fallo en Servidor',
					detail: err.error?.detalle || 'Error al procesar la emisión.',
				});
			},
		});
	}
}
