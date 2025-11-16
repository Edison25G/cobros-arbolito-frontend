import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card'; // Opcional si usas el diseño personalizado
import { SkeletonModule } from 'primeng/skeleton'; // Opcional ya que usas Tailwind animate-pulse
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';

import { AuthService } from '../../../core/services/auth.service';
import { SocioService } from '../../../core/services/socio.service'; // <--- IMPORTANTE
import { RolUsuario } from '../../../core/models/role.enum';

@Component({
	selector: 'amc-home',
	standalone: true,
	imports: [CommonModule, RouterModule, CardModule, SkeletonModule, ChartModule, ButtonModule],
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
	private authService = inject(AuthService);
	private socioService = inject(SocioService); // <--- INYECCIÓN DEL SERVICIO

	userRole: RolUsuario | null = null;
	Role = RolUsuario;

	// Control de estado visual
	isLoading = true;
	isEmpty = false;
	reporteData: any = null;

	// Configuración del Gráfico (Datos visuales simulados por ahora)
	barChartData: any;
	barChartOptions: any;

	ngOnInit(): void {
		this.userRole = this.authService.getRole() as RolUsuario;

		if (this.userRole === RolUsuario.ADMIN || this.userRole === RolUsuario.TESORERO) {
			this.loadDashboardData();
		} else {
			this.isLoading = false;
		}

		// Iniciamos la config del gráfico aunque no tengamos datos reales aún
		this.initChart();
	}

	loadDashboardData() {
		this.isLoading = true;

		// LLAMADA REAL A LA API DE SOCIOS
		this.socioService.getSocios().subscribe({
			next: (socios) => {
				// 1. Calcular datos REALES
				const totalSocios = socios.length;

				// Si no hay socios, activamos el estado "Empty"
				if (totalSocios === 0) {
					this.isEmpty = true;
					this.reporteData = null;
				} else {
					this.isEmpty = false;

					// 2. Construimos el reporte (HÍBRIDO: Real + Falso)
					this.reporteData = {
						sociosActivos: totalSocios, // <--- ¡DATO REAL DE TU BD!
						sociosEnMora: 0, // Placeholder (Falta API Cobros)
						totalRecaudadoMes: 0, // Placeholder (Falta API Cobros)
						totalDeuda: 0, // Placeholder (Falta API Cobros)
					};
				}

				this.isLoading = false;
			},
			error: (err) => {
				console.error('Error al cargar datos del dashboard:', err);
				// En caso de error, quitamos el loading para que no se quede pegado
				this.isLoading = false;
				// Opcional: Podrías mostrar un mensaje de error aquí
			},
		});
	}

	initChart() {
		const documentStyle = getComputedStyle(document.documentElement);
		const textColor = documentStyle.getPropertyValue('--text-color');
		const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
		const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

		this.barChartData = {
			labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
			datasets: [
				{
					label: 'Recaudación ($)',
					data: [0, 0, 0, 0, 0, 0], // Datos vacíos por ahora
					backgroundColor: '#10b981', // Emerald-500
					borderRadius: 6,
				},
			],
		};

		this.barChartOptions = {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: { labels: { color: textColor } },
			},
			scales: {
				y: {
					beginAtZero: true,
					grid: { color: surfaceBorder, drawBorder: false },
					ticks: { color: textColorSecondary },
				},
				x: {
					grid: { color: surfaceBorder, drawBorder: false },
					ticks: { color: textColorSecondary },
				},
			},
		};
	}
}
