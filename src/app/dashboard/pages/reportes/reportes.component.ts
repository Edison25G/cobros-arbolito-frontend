import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table'; // Agregamos tabla para ver detalles
import { MessageService } from 'primeng/api';

// Servicios
import { ReporteService } from '../../../core/services/reporte.service';
import { FacturaReporte } from '../../../core/interfaces/reporte.interfaces';

// PDF
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
	],
	providers: [MessageService],
	templateUrl: './reportes.component.html',
})
export class ReportesComponent implements OnInit {
	private reporteService = inject(ReporteService);
	private messageService = inject(MessageService);

	// Filtros
	rangeDates: Date[] | undefined;
	isLoading = false;

	// Datos
	transacciones: FacturaReporte[] = [];
	chartData: any;
	chartOptions: any;

	ngOnInit() {
		this.initChart();
		// Cargamos datos iniciales (ej: mes actual)
		const hoy = new Date();
		this.buscarDatos(hoy, hoy);
	}

	buscarDatos(inicio: Date, fin: Date) {
		this.isLoading = true;
		this.reporteService.getDetalleTransacciones(inicio, fin).subscribe({
			next: (data) => {
				this.transacciones = data;
				this.isLoading = false;
			},
			error: () => {
				this.isLoading = false;
				this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se cargaron los datos' });
			},
		});
	}

	filtrarPorFechas() {
		if (this.rangeDates && this.rangeDates[1]) {
			this.buscarDatos(this.rangeDates[0], this.rangeDates[1]);
			this.messageService.add({ severity: 'info', summary: 'Filtrado', detail: 'Datos actualizados por fecha.' });
		}
	}

	// --- LÓGICA DE PDF ---
	descargarPDF() {
		const doc = new jsPDF();

		// Título
		doc.setFontSize(18);
		doc.text('Reporte Financiero - El Arbolito', 14, 20);
		doc.setFontSize(10);
		doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 28);

		// Tabla
		const columnas = [['Fecha', 'Socio', 'Concepto', 'Estado', 'Monto']];
		const data = this.transacciones.map((t) => [t.fecha, t.socio, t.concepto, t.estado, `$${t.monto.toFixed(2)}`]);

		autoTable(doc, {
			head: columnas,
			body: data,
			startY: 35,
			theme: 'grid',
		});

		// Total
		const total = this.transacciones.reduce((acc, curr) => acc + curr.monto, 0);
		const finalY = (doc as any).lastAutoTable.finalY + 10;
		doc.setFontSize(12);
		doc.text(`TOTAL RECAUDADO: $${total.toFixed(2)}`, 14, finalY);

		doc.save('reporte_arbolito.pdf');
		this.messageService.add({
			severity: 'success',
			summary: 'PDF Generado',
			detail: 'El reporte se descargó correctamente.',
		});
	}

	// Configuración visual del gráfico
	initChart() {
		this.chartData = {
			labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
			datasets: [
				{
					label: 'Ingresos ($)',
					backgroundColor: '#23A455',
					data: [3000, 3500, 3200, 4100, 3900, 4250],
				},
			],
		};

		this.chartOptions = {
			plugins: { legend: { labels: { color: '#495057' } } },
			scales: {
				x: { ticks: { color: '#495057' }, grid: { color: '#ebedef' } },
				y: { ticks: { color: '#495057' }, grid: { color: '#ebedef' } },
			},
		};
	}
}
