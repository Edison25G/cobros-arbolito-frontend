import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// --- Servicios y Modelos ---
import { ReporteService } from '../../../core/services/reporte.service';
// 1. ¡CORRECCIÓN DE IMPORTACIÓN! Importamos la interfaz desde 'interfaces'
import { ReporteGeneral } from '../../../core/interfaces/reporte.interfaces';
// 2. Importamos el ErrorService que querías usar
import { ErrorService } from '../../../auth/core/services/error.service';

// --- Imports de PrimeNG v20 (Standalone) ---
// 3. ¡CORRECCIÓN DE PRIMENG! Importamos Componentes, NO Módulos
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
	selector: 'amc-reportes',
	standalone: true,
	imports: [
		CommonModule,
		// 4. ¡CORRECCIÓN DE PRIMENG! Usamos los componen
		// tes standalone
		CardModule,
		ChartModule,
		SkeletonModule,
		ToastModule,
	],
	providers: [MessageService], // MessageService es necesario para Toast y ErrorService
	templateUrl: './reportes.component.html',
	styleUrls: ['./reportes.component.css'],
})
export class ReportesComponent implements OnInit {
	// --- Inyección de Servicios ---
	private reporteService = inject(ReporteService);
	private errorService = inject(ErrorService); // 5. Inyectamos ErrorService

	// --- Estado del Componente ---
	public reporteData: ReporteGeneral | null = null;
	public isLoading = true;

	// --- Opciones de la Gráfica ---
	public barChartData: any;
	public barChartOptions: any;

	constructor() {}

	ngOnInit(): void {
		this.initChartOptions();
		this.loadReporte();
	}

	loadReporte(): void {
		this.isLoading = true;

		this.reporteService.getReporteGeneral().subscribe({
			next: (data) => {
				this.reporteData = data;
				this.initBarChart(data.recaudacionUltimos6Meses);
				this.isLoading = false;
				console.log('Reporte cargado:', this.reporteData);
			},
			error: (err) => {
				console.error('Error al cargar reporte:', err);
				this.isLoading = false;
				// 6. Usamos el ErrorService (con el método que sí existe)
				this.errorService.showError('No se pudo cargar el reporte.');
			},
		});
	}

	initBarChart(datosMeses: number[]): void {
		this.barChartData = {
			labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
			datasets: [
				{
					label: 'Recaudación Mensual ($)',
					backgroundColor: '#10b981',
					borderColor: '#059669',
					data: datosMeses,
				},
			],
		};
	}

	initChartOptions(): void {
		this.barChartOptions = {
			maintainAspectRatio: false,
			aspectRatio: 0.8,
			plugins: {
				legend: {
					labels: {
						color: '#4b5563',
					},
				},
			},
			scales: {
				x: {
					ticks: { color: '#6b7280' },
					grid: { color: 'rgba(209, 213, 219, 0.2)' },
				},
				y: {
					ticks: {
						color: '#6b7280',
						callback: function (value: number) {
							return '$' + value.toLocaleString();
						},
					},
					grid: {
						color: 'rgba(209, 213, 219, 0.2)',
					},
				},
			},
		};
	}
}
