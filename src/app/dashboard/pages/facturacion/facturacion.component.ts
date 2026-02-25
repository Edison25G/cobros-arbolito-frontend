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

		// 1. Clonamos para el buffer de error y LIMPIAMOS LA VISTA DE INMEDIATO
		const datosBuffer = [...this.lecturasPendientes];
		this.lecturasPendientes = [];
		this.calcularResumen(); // Esto pone los contadores en 0 instantáneamente

		this.facturacionService.generarEmisionMasiva(datosBuffer).subscribe({
			next: (res: any) => {
				// 2. Si el back ignoró algunos por ser duplicados, suele mandar un mensaje descriptivo
				const fueDuplicado =
					res.mensaje?.toLowerCase().includes('ya existe') || res.detalle?.toLowerCase().includes('duplicate');

				this.messageService.add({
					severity: fueDuplicado ? 'info' : 'success',
					summary: fueDuplicado ? 'Información' : '¡Proceso Exitoso!',
					detail: res.mensaje || 'Proceso completado correctamente.',
					life: 4000,
				});

				// 3. Forzamos la finalización para limpiar cualquier rastro
				this.finalizarProceso();
			},
			error: (err) => {
				// Si hubo un error real de red o servidor, devolvemos los datos
				this.lecturasPendientes = datosBuffer;
				this.isProcessing = false;
				this.calcularResumen();

				this.messageService.add({
					severity: 'error',
					summary: 'Error',
					detail: err.error?.detalle || 'No se pudo procesar la solicitud.',
					life: 5000,
				});
			},
		});
	}

	private finalizarProceso() {
		// RESET TOTAL de variables locales
		this.lecturasPendientes = [];
		this.totalPlanillasMedidor = 0;
		this.totalAgua = 0;
		this.totalMultas = 0;
		this.granTotal = 0;
		this.isProcessing = false;

		// Llamamos al GET para asegurarnos de que la tabla refleje lo que el BACK diga que falta
		this.buscarPreEmision();
	}
}
