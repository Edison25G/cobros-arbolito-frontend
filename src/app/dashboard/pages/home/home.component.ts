import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// --- Servicios y Modelos ---
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/role.enum';
import { ReporteService, ReporteGeneral } from '../../../core/services/reporte.service';

// --- Imports de PrimeNG ---
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { ChartModule } from 'primeng/chart';

@Component({
	selector: 'ca-home',
	standalone: true,
	imports: [CommonModule, RouterModule, CardModule, ButtonModule, SkeletonModule, ChartModule],
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
	private authService = inject(AuthService);
	private reporteService = inject(ReporteService);

	// --- SOLUCIÓN DEL BUG TS2322 ---
	// El tipo se mantiene como 'Role | null', pero lo forzamos en la asignación.
	public userRole: Role | null = null;
	public reporteData: ReporteGeneral | null = null;
	public isLoading = false;

	public Role = Role;

	public barChartData: any;
	public barChartOptions: any;

	constructor() {}

	ngOnInit(): void {
		// 🔥 ASIGNACIÓN CORREGIDA: Usamos 'as Role | null' para resolver el conflicto de tipos de localStorage.
		this.userRole = this.authService.getRole() as Role | null;

		// Carga los reportes SÓLO si es Admin o Secretario
		if (this.userRole === Role.Admin || this.userRole === Role.Secretario) {
			this.initChartOptions();
			this.loadReporte();
		}
	}

	loadReporte(): void {
		this.isLoading = true;
		this.reporteService.getReporteGeneral().subscribe({
			next: (data) => {
				this.reporteData = data;
				this.initBarChart(data.recaudacionUltimos6Meses);
				this.isLoading = false;
			},
			error: (err) => {
				console.error('Error al cargar reporte:', err);
				this.isLoading = false;
			},
		});
	}

	// --- Lógica de la Gráfica ---

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
					labels: { color: '#4b5563' },
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
					grid: { color: 'rgba(209, 213, 219, 0.2)' },
				},
			},
		};
	}
}
