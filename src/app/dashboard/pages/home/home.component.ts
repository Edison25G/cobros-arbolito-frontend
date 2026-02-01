import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs'; // ✅ Necesario para cargar todo junto

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

// Servicios
import { AuthService } from '../../../core/services/auth.service';
import { SocioService } from '../../../core/services/socio.service';
import { ReporteService } from '../../../core/services/reporte.service'; // ✅ Importante
import { RolUsuario } from '../../../core/models/role.enum';

interface DashboardStats {
	sociosActivos: number;
	sociosEnMora: number;
	totalRecaudadoMes: number;
	totalDeuda: number;
}

@Component({
	selector: 'amc-home',
	standalone: true,
	imports: [CommonModule, RouterModule, CardModule, SkeletonModule, ChartModule, ButtonModule],
	providers: [MessageService],
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
	private authService = inject(AuthService);
	private socioService = inject(SocioService);
	private reporteService = inject(ReporteService); // ✅ Inyectamos el servicio
	private messageService = inject(MessageService);

	userRole: RolUsuario | null = null;
	Role = RolUsuario;

	isLoading = true;
	isEmpty = false;

	reporteData: DashboardStats = {
		sociosActivos: 0,
		sociosEnMora: 0,
		totalRecaudadoMes: 0,
		totalDeuda: 0,
	};

	barChartData: any;
	barChartOptions: any;

	ngOnInit(): void {
		this.checkRole();
		this.initChart();
		this.loadDashboardData();
	}

	checkRole() {
		const roleString = this.authService.getRole();
		if (roleString) {
			const roleUpper = roleString.toUpperCase();
			if (roleUpper.includes('ADMIN')) this.userRole = RolUsuario.ADMIN;
			else if (roleUpper === 'TESORERO') this.userRole = RolUsuario.TESORERO;
			else if (roleUpper === 'OPERADOR') this.userRole = RolUsuario.OPERADOR;
			else this.userRole = RolUsuario.SOCIO;
		}
	}

	loadDashboardData() {
		if (this.userRole === RolUsuario.OPERADOR) {
			this.isLoading = false;
			return;
		}

		this.isLoading = true;

		// Calculamos el rango de fechas de ESTE MES para la caja
		const hoy = new Date();
		const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
		const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

		// ✅ PEDIMOS TODO A LA VEZ: Socios, Cartera (Deudas) y Caja (Ingresos)
		forkJoin({
			socios: this.socioService.getSocios(),
			cartera: this.reporteService.getReporteCartera(),
			caja: this.reporteService.getCierreCaja(inicioMes, finMes),
		})
			.pipe(
				finalize(() => {
					this.isLoading = false;
				}),
			)
			.subscribe({
				next: (res) => {
					// 1. Total Socios
					this.reporteData.sociosActivos = res.socios.length;

					// 2. Socios en Mora y Deuda Total (Calculado desde la lista de cartera)
					this.reporteData.sociosEnMora = res.cartera.length;
					this.reporteData.totalDeuda = res.cartera.reduce((acc, item) => acc + item.total_deuda, 0);

					// 3. Recaudado del Mes (Viene del cierre de caja)
					this.reporteData.totalRecaudadoMes = res.caja.total_general;

					this.isEmpty = this.reporteData.sociosActivos === 0;

					// 4. Actualizar Gráfico
					this.updateChartData(this.reporteData.totalRecaudadoMes);
				},
				error: (err) => {
					console.error('Error dashboard:', err);
					// Si falla uno, intentamos mostrar al menos los datos vacíos sin romper la app
					this.isLoading = false;
				},
			});
	}

	// Pone el valor recaudado en la barra del mes actual
	private updateChartData(montoMes: number) {
		const mesActual = new Date().getMonth(); // 0 = Enero, 1 = Feb...

		// Array de 12 ceros
		const datosAnuales = Array(12).fill(0);
		// Ponemos el monto en el mes correcto
		datosAnuales[mesActual] = montoMes;

		this.barChartData = {
			labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
			datasets: [
				{
					label: 'Recaudación 2026 ($)',
					data: datosAnuales,
					backgroundColor: '#10b981',
					borderRadius: 6,
				},
			],
		};
	}

	private initChart() {
		const documentStyle = getComputedStyle(document.documentElement);
		const textColor = documentStyle.getPropertyValue('--text-color');
		const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

		this.barChartData = { labels: [], datasets: [] }; // Inicial vacío

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
					ticks: { color: textColor },
				},
				x: {
					grid: { color: surfaceBorder, drawBorder: false },
					ticks: { color: textColor },
				},
			},
		};
	}
}
