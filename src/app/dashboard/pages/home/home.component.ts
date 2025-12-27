import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators'; // ✅ Importante para manejo de estado

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api'; // ✅ Para notificaciones de error

// Servicios y Modelos
import { AuthService } from '../../../core/services/auth.service';
import { SocioService } from '../../../core/services/socio.service';
import { RolUsuario } from '../../../core/models/role.enum';

// Interfaz local para los datos del reporte (Mejor que usar 'any')
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
	providers: [MessageService], // Proveedor local para mensajes
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
	// Inyecciones
	private authService = inject(AuthService);
	private socioService = inject(SocioService);
	private messageService = inject(MessageService);

	// Estado del Usuario
	userRole: RolUsuario | null = null;
	Role = RolUsuario; // Para usar en el HTML

	// Control de estado visual
	isLoading = true;
	isEmpty = false;

	// Datos del reporte inicializados en 0
	reporteData: DashboardStats = {
		sociosActivos: 0,
		sociosEnMora: 0, // Placeholder
		totalRecaudadoMes: 0, // Placeholder
		totalDeuda: 0, // Placeholder
	};

	// Configuración del Gráfico
	barChartData: any;
	barChartOptions: any;

	ngOnInit(): void {
		this.userRole = this.authService.getRole() as RolUsuario;

		// Iniciamos configuración visual
		this.initChart();

		// Carga de datos
		this.loadDashboardData();
	}

	loadDashboardData() {
		this.isLoading = true;

		// 🔒 SEGURIDAD: Prevenimos el error 403 Forbidden.
		// Si es Operador, NO llamamos a getSocios().
		if (this.userRole === RolUsuario.OPERADOR) {
			this.isLoading = false;
			return; // Salimos de la función aquí
		}

		// Si es Admin o Tesorero, procedemos con la carga
		this.socioService
			.getSocios()
			.pipe(
				// ✅ finalize se ejecuta SIEMPRE (éxito o error)
				finalize(() => {
					this.isLoading = false;
				}),
			)
			.subscribe({
				next: (socios) => {
					const totalSocios = socios.length;

					if (totalSocios === 0) {
						this.isEmpty = true;
					} else {
						this.isEmpty = false;
						// Actualizamos solo los datos reales
						this.reporteData.sociosActivos = totalSocios;

						// Aquí irán las futuras llamadas a CobrosService para llenar el resto
					}
				},
				error: (err) => {
					console.error('Error dashboard:', err);

					// Opcional: Mostrar mensaje al usuario si la API falla
					// this.messageService.add({severity:'error', summary:'Error', detail:'No se pudieron cargar los datos'});
				},
			});
	}

	// Configuración del gráfico (Estética)
	private initChart() {
		const documentStyle = getComputedStyle(document.documentElement);
		const textColor = documentStyle.getPropertyValue('--text-color');
		const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
		const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

		this.barChartData = {
			labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
			datasets: [
				{
					label: 'Recaudación ($)',
					data: [0, 0, 0, 0, 0, 0], // Datos simulados
					backgroundColor: '#10b981', // Tailwind Emerald-500
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
