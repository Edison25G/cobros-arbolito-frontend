import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// --- Servicios y Modelos ---
import { ReporteService, ReporteGeneral } from '@core/services/reporte.service';

// --- Imports de PrimeNG ---
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton'; // Usaremos esto para la carga

@Component({
	selector: 'amc-reportes',
	standalone: true,
	imports: [
		CommonModule,
		// --- Módulos de PrimeNG ---
		CardModule,
		ChartModule,
		SkeletonModule, // Skeleton es mejor que un spinner para tarjetas
	],
	templateUrl: './reportes.component.html',
	styleUrls: ['./reportes.component.css'],
})
export class ReportesComponent implements OnInit {
	// --- Inyección de Servicios ---
	private reporteService = inject(ReporteService);

	// --- Estado del Componente ---
	public reporteData: ReporteGeneral | null = null;
	public isLoading = true;

	// --- Opciones de la Gráfica ---
	public barChartData: any; // Datos del gráfico (se inicializa después)
	public barChartOptions: any; // Opciones del gráfico (se inicializa en ngOnInit)

	constructor() {}

	/**
	 * ngOnInit: Se ejecuta al cargar el componente.
	 */
	ngOnInit(): void {
		this.initChartOptions(); // Prepara las opciones del gráfico
		this.loadReporte(); // Llama al servicio para obtener los datos
	}

	/**
	 * Llama al servicio para cargar los datos del reporte
	 */
	loadReporte(): void {
		this.isLoading = true;

		this.reporteService.getReporteGeneral().subscribe({
			next: (data) => {
				// Éxito: Guarda los datos
				this.reporteData = data;

				// Llama a la función para construir el gráfico con los datos recibidos
				this.initBarChart(data.recaudacionUltimos6Meses);

				this.isLoading = false;
				console.log('Reporte cargado:', this.reporteData);
			},
			error: (err) => {
				// Error: Apaga el spinner y muestra un error
				console.error('Error al cargar reporte:', err);
				this.isLoading = false;
				// this.errorService.showError('No se pudo cargar el reporte.');
			},
		});
	}

	/**
	 * Inicializa los DATOS del gráfico de barras
	 * (Se llama DESPUÉS de recibir los datos)
	 */
	initBarChart(datosMeses: number[]): void {
		this.barChartData = {
			labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'], // Ajustar si son más meses
			datasets: [
				{
					label: 'Recaudación Mensual ($)',
					backgroundColor: '#10b981', // Color verde esmeralda
					borderColor: '#059669',
					data: datosMeses, // <-- Los datos reales del servicio
				},
			],
		};
	}

	/**
	 * Inicializa las OPCIONES del gráfico de barras
	 * (Se llama en ngOnInit)
	 */
	initChartOptions(): void {
		this.barChartOptions = {
			maintainAspectRatio: false, // Para que se ajuste al contenedor
			aspectRatio: 0.8, // Proporción
			plugins: {
				legend: {
					labels: {
						color: '#4b5563', // Color de texto gris
					},
				},
			},
			scales: {
				x: {
					ticks: {
						color: '#6b7280',
					},
					grid: {
						color: 'rgba(209, 213, 219, 0.2)', // Color de la cuadrícula X
					},
				},
				y: {
					ticks: {
						color: '#6b7280',
						callback: function (value: number) {
							return '$' + value.toLocaleString(); // Formatea el eje Y como dinero
						},
					},
					grid: {
						color: 'rgba(209, 213, 219, 0.2)', // Color de la cuadrícula Y
					},
				},
			},
		};
	}
}
