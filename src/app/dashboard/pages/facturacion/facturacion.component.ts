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
		if (this.isProcessing || !this.lecturasPendientes.length) return;

		this.isProcessing = true;

		// GUARDAMOS LOS DATOS Y LIMPIAMOS LA TABLA DE UNA VEZ
		// Esto visualmente le dice al usuario: "Ya recibí tu orden, estoy procesando"
		const datosBuffer = [...this.lecturasPendientes];
		this.lecturasPendientes = [];
		this.calcularResumen();

		this.facturacionService.generarEmisionMasiva(datosBuffer).subscribe({
			next: (res: any) => {
				this.messageService.add({
					severity: 'success',
					summary: '¡Proceso Exitoso!',
					detail: res.mensaje || 'Todas las planillas han sido generadas.',
					life: 4000,
				});
				// Refrescamos desde el servidor por si quedó algo pendiente
				this.finalizarProceso();
			},
			error: (err) => {
				// Si el servidor falla de verdad (error 500, caída de red):
				// Devolvemos los datos a la tabla para que no se pierda la vista
				this.lecturasPendientes = datosBuffer;
				this.isProcessing = false;
				this.calcularResumen();

				this.messageService.add({
					severity: 'error',
					summary: 'Error de Conexión',
					detail: err.error?.detalle || 'El servidor no pudo procesar la solicitud. Intente de nuevo.',
					life: 5000,
				});
				console.error('Error Crítico:', err);
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
