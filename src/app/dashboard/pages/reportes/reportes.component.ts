import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select'; // <--- IMPORTANTE
import { MessageService } from 'primeng/api';

import { ReporteService } from '../../../core/services/reporte.service';
import { ReporteCarteraItem } from '../../../core/interfaces/reporte.interfaces';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
	selector: 'app-reportes',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		CardModule,
		ChartModule,
		ButtonModule,
		DatePickerModule,
		ToolbarModule,
		ToastModule,
		TableModule,
		SelectModule,
	],
	providers: [MessageService],
	templateUrl: './reportes.component.html',
})
export class ReportesComponent implements OnInit {
	private reporteService = inject(ReporteService);
	private messageService = inject(MessageService);

	// Variables UI
	isLoading = false;
	rangeDates: Date[] | undefined;

	// Datos
	datosOriginales: ReporteCarteraItem[] = []; // Copia pura de la API
	datosVisibles: ReporteCarteraItem[] = []; // Lo que se ve en la tabla (Filtrado)

	// Filtros
	filtroTexto = '';
	filtroBarrio = 'TODOS';

	// Opciones para el Dropdown de Barrios (Se llenan solas)
	opcionesBarrios: any[] = [{ label: 'Todos los Barrios', value: 'TODOS' }];

	// Gráficos y KPIs
	chartData: any;
	chartOptions: any;
	totalDeuda = 0;
	totalSocios = 0;

	ngOnInit() {
		this.initChartOptions();
		this.cargarDatos();
	}

	cargarDatos() {
		this.isLoading = true;
		// Llamamos a tu servicio real (que ya corregimos)
		this.reporteService.getReporteCartera().subscribe({
			next: (data) => {
				this.datosOriginales = data;
				this.datosVisibles = data;

				// 1. Extraer Barrios únicos para el filtro
				this.generarFiltroBarrios(data);

				// 2. Calcular Totales
				this.recalcularKPIs();

				// 3. Actualizar Gráfico
				this.actualizarGrafico();

				this.isLoading = false;
			},
			error: () => {
				this.isLoading = false;
				this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se cargaron los datos.' });
			},
		});
	}

	// --- LÓGICA DE FILTROS ---

	// Extrae los barrios (Ej: "Centro", "San Felipe") de los datos reales
	generarFiltroBarrios(data: ReporteCarteraItem[]) {
		const barriosUnicos = [...new Set(data.map((item) => item.barrio))];
		this.opcionesBarrios = [
			{ label: 'Todos los Barrios', value: 'TODOS' },
			...barriosUnicos.map((b) => ({ label: b, value: b })),
		];
	}

	// Aplica Búsqueda + Filtro de Barrio al mismo tiempo
	aplicarFiltros() {
		const texto = this.filtroTexto.toLowerCase();

		this.datosVisibles = this.datosOriginales.filter((item) => {
			// 1. Coincide con Texto (Nombre o CI)
			const coincideTexto = item.nombre.toLowerCase().includes(texto) || item.identificacion.includes(texto);

			// 2. Coincide con Barrio
			const coincideBarrio = this.filtroBarrio === 'TODOS' || item.barrio === this.filtroBarrio;

			return coincideTexto && coincideBarrio;
		});

		this.recalcularKPIs(); // Recalcular totales con lo filtrado
	}

	recalcularKPIs() {
		this.totalDeuda = this.datosVisibles.reduce((acc, i) => acc + i.total_deuda, 0);
		this.totalSocios = this.datosVisibles.length;
	}

	actualizarGrafico() {
		const corriente = this.datosVisibles.reduce((acc, i) => acc + i.corriente, 0);
		const vencido = this.datosVisibles.reduce((acc, i) => acc + i.vencido_1_3, 0);
		const incobrable = this.datosVisibles.reduce((acc, i) => acc + i.incobrable, 0);

		this.chartData = {
			labels: ['Corriente', 'Mora 1-3 Meses', 'Mora Crítica'],
			datasets: [
				{
					data: [corriente, vencido, incobrable],
					backgroundColor: ['#22C55E', '#F59E0B', '#EF4444'],
					hoverBackgroundColor: ['#16A34A', '#D97706', '#DC2626'],
				},
			],
		};
	}

	// --- PDF ---
	descargarPDF() {
		const doc = new jsPDF();
		doc.text('Reporte de Pendientes (Cartera Vencida)', 14, 20);
		doc.setFontSize(10);
		doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 28);

		// Tabla PDF usando los datos visibles (filtrados)
		const data = this.datosVisibles.map((i) => [
			i.nombre,
			i.barrio,
			`$${i.total_deuda.toFixed(2)}`,
			i.facturas_pendientes,
		]);

		autoTable(doc, {
			head: [['Socio', 'Barrio', 'Deuda Total', 'Facturas']],
			body: data,
			startY: 35,
		});
		doc.save('reporte_pendientes.pdf');
	}

	initChartOptions() {
		this.chartOptions = { plugins: { legend: { position: 'bottom' } } };
	}
}
