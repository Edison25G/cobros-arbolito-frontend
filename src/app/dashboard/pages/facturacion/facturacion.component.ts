import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// --- PrimeNG Imports ---
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

// --- Servicios y Modelos ---
// Asegúrate de que la ruta sea correcta según tu estructura
import { FacturacionService } from '../../../core/services/facturacion.service';
import { LecturaPendiente } from '../../../core/interfaces/factura.interface';

@Component({
	selector: 'app-factura', // Selector ajustado al nombre del componente
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
	// Inyecciones
	private messageService = inject(MessageService);
	private facturacionService = inject(FacturacionService);

	// Variables
	fechaEmision: Date = new Date(); // Fecha seleccionada (Mes/Año)

	// ✅ Usamos la interfaz correcta para evitar errores de tipo
	lecturasPendientes: LecturaPendiente[] = [];

	isLoading = false;
	isProcessing = false; // Loading para el botón de generar

	// Totales para las tarjetas (KPIs)
	totalPlanillas = 0;
	totalAgua = 0;
	totalMultas = 0;
	granTotal = 0;

	ngOnInit() {
		// Cargar datos al iniciar
		this.buscarPendientes();
	}

	buscarPendientes() {
		this.isLoading = true;

		// AQUÍ SIMULAMOS LA RESPUESTA DEL BACKEND
		// (Luego usarás: this.facturacionService.getPendientes(...))
		setTimeout(() => {
			this.lecturasPendientes = [
				{
					id: 101,
					fecha_lectura: '2025-11-28',
					medidor: 'MED-001', // Puede ser string o objeto, la interfaz lo permite
					socio: 'Juan Perez', // Puede ser string o objeto
					cedula: '0551478018',
					lectura_anterior: 450,
					lectura_actual: 465,
					consumo: 15,
					// Datos financieros
					monto_agua: 3.5,
					multas_mingas: 0,
					detalle_multas: [],
					total_pagar: 3.5,
				},
				{
					id: 102,
					fecha_lectura: '2025-11-28',
					medidor: 'MED-002',
					socio: 'Maria Lopez',
					cedula: '0502002413',
					lectura_anterior: 1200,
					lectura_actual: 1250,
					consumo: 50,
					monto_agua: 21.0,
					multas_mingas: 10.0,
					detalle_multas: ['Minga Limpieza Canales'],
					total_pagar: 31.0,
				},
				{
					id: 103,
					fecha_lectura: '2025-11-28',
					medidor: 'MED-003',
					socio: 'Carlos Vives',
					cedula: '1718929921',
					lectura_anterior: 100,
					lectura_actual: 110,
					consumo: 10,
					monto_agua: 3.5,
					multas_mingas: 5.0,
					detalle_multas: ['Reunión General'],
					total_pagar: 8.5,
				},
			];

			this.calcularResumen();
			this.isLoading = false;
		}, 800);
	}

	calcularResumen() {
		this.totalPlanillas = this.lecturasPendientes.length;
		// Usamos reduce para sumar (si monto_agua es undefined, suma 0)
		this.totalAgua = this.lecturasPendientes.reduce((acc, item) => acc + (item.monto_agua || 0), 0);
		this.totalMultas = this.lecturasPendientes.reduce((acc, item) => acc + (item.multas_mingas || 0), 0);
		this.granTotal = this.totalAgua + this.totalMultas;
	}

	generarEmisionMasiva() {
		if (this.totalPlanillas === 0) return;

		this.isProcessing = true;

		// Simulación de llamada al servicio
		setTimeout(() => {
			this.messageService.add({
				severity: 'success',
				summary: 'Emisión Exitosa',
				detail: `Se generaron ${this.totalPlanillas} facturas por un total de $${this.granTotal.toFixed(2)}. Estado: PENDIENTE`,
			});

			// Limpiar tabla (simulando que ya se procesaron y ya no están pendientes)
			this.lecturasPendientes = [];
			this.calcularResumen();
			this.isProcessing = false;
		}, 1500);
	}
}
