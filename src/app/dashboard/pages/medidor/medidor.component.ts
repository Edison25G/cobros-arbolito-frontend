import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// --- CAMBIO CLAVE: Usamos la interfaz que coincide con tu Backend (Puerto 8000) ---
import { MedidorService } from '../../../core/services/mi-medidor.service';
import { MedidorBackend, HistorialConsumo } from '../../../core/interfaces/mi-medidor';
// ----------------------------------------------------------------------------------

import { ErrorService } from '../../../auth/core/services/error.service';

// --- Imports de PrimeNG ---
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
	selector: 'amc-medidor',
	standalone: true,
	imports: [
		CommonModule,
		CardModule,
		TagModule,
		SkeletonModule,
		ChartModule,
		ButtonModule,
		ToastModule,
		ConfirmDialogModule,
	],
	providers: [MessageService, ConfirmationService], // Proveedores necesarios para Toast y Confirm
	templateUrl: './medidor.component.html',
	styleUrls: ['./medidor.component.css'],
})
export class MedidorComponent implements OnInit {
	// --- Inyección de Servicios ---
	private medidorService = inject(MedidorService);
	private errorService = inject(ErrorService);
	private messageService = inject(MessageService);
	private confirmationService = inject(ConfirmationService);

	// --- Datos ---
	// CAMBIO AQUÍ: Ahora usamos MedidorBackend porque es lo que devuelve el servicio real
	public medidor: MedidorBackend | undefined;
	public historial: HistorialConsumo[] = [];

	// --- Configuración del Gráfico ---
	public chartData: any;
	public chartOptions: any;

	// --- Estado de Carga ---
	public isLoading = true;

	constructor() {}

	ngOnInit(): void {
		this.cargarDatos();
	}

	cargarDatos(): void {
		this.isLoading = true;

		// 1. Cargar Info del Medidor (Real desde el Backend)
		this.medidorService.getMedidorDelSocioLogueado().subscribe({
			next: (data) => {
				// Asignamos los datos reales (codigo, nombre_barrio, etc.)
				this.medidor = data;

				// 2. Una vez cargado el medidor, cargamos el historial (Gráfico)
				this.cargarHistorialYGrafico();
			},
			error: (_err) => {
				this.isLoading = false;
				// Mostramos error pero dejamos que el usuario lo vea en la UI (state vacío)
				this.errorService.showError('No se pudo cargar la información del medidor.');
			},
		});
	}

	// Promedio de consumo calculado
	public promedioConsumo = 0;

	cargarHistorialYGrafico() {
		// Pasamos el código del medidor para filtrar las lecturas
		const codigoMedidor = this.medidor?.codigo;

		this.medidorService.getHistorialConsumo(codigoMedidor).subscribe({
			next: (data) => {
				this.historial = data;
				this.calcularPromedio(data);
				this.initChart(data);
				this.isLoading = false;
			},
			error: () => {
				this.historial = [];
				this.promedioConsumo = 0;
				this.isLoading = false;
			},
		});
	}

	/**
	 * Calcula el promedio de consumo del historial
	 */
	calcularPromedio(historial: HistorialConsumo[]): void {
		if (!historial || historial.length === 0) {
			this.promedioConsumo = 0;
			return;
		}
		const total = historial.reduce((sum, h) => sum + (h.consumo || 0), 0);
		const promedio = total / historial.length;
		this.promedioConsumo = isNaN(promedio) ? 0 : Math.round(promedio);
	}

	/**
	 * Configura el gráfico de Chart.js
	 */
	initChart(historial: HistorialConsumo[]) {
		const documentStyle = getComputedStyle(document.documentElement);
		const textColor = documentStyle.getPropertyValue('--text-color');
		const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

		const etiquetas = historial.map((h) => h.mes);
		const valores = historial.map((h) => h.consumo);

		this.chartData = {
			labels: etiquetas,
			datasets: [
				{
					label: 'Consumo de Agua (m³)',
					data: valores,
					fill: true,
					borderColor: '#10b981', // Verde Arbolito
					backgroundColor: 'rgba(16, 185, 129, 0.2)',
					tension: 0.4,
				},
			],
		};

		this.chartOptions = {
			maintainAspectRatio: false,
			aspectRatio: 0.6,
			plugins: {
				legend: {
					labels: { color: textColor },
				},
				title: {
					display: true,
					text: 'Tu Historial de Consumo',
					font: { size: 16 },
				},
			},
			scales: {
				x: {
					ticks: { color: textColor },
					grid: { color: surfaceBorder, drawBorder: false },
				},
				y: {
					ticks: { color: textColor },
					grid: { color: surfaceBorder, drawBorder: false },
					beginAtZero: true,
				},
			},
		};
	}
}
