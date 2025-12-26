import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { ReporteGeneral, FacturaReporte } from '../interfaces/reporte.interfaces';

@Injectable({
	providedIn: 'root',
})
export class ReporteService {
	private apiUrl = environment.apiUrl;

	constructor() {}

	/**
	 * Datos para el HOME (KPIs)
	 */
	getReporteGeneral(): Observable<ReporteGeneral> {
		return of({
			sociosActivos: 124,
			sociosEnMora: 15,
			totalRecaudadoMes: 4250.5,
			totalDeuda: 850.0,
			recaudacionUltimos6Meses: [3000, 3500, 3200, 4100, 3900, 4250],
		}).pipe(delay(800));
	}

	/**
	 * Datos para la pantalla REPORTES (Tabla detallada para PDF)
	 * Simula una búsqueda por fechas.
	 */
	getDetalleTransacciones(_inicio: Date, _fin: Date): Observable<FacturaReporte[]> {
		// Aquí el backend filtraría por fecha. Simulamos datos:
		const mockData: FacturaReporte[] = [
			{ id: 101, fecha: '2025-06-01', socio: 'Juan Pérez', concepto: 'Consumo Mayo', monto: 15.5, estado: 'Pagado' },
			{ id: 102, fecha: '2025-06-02', socio: 'María López', concepto: 'Consumo Mayo', monto: 12.0, estado: 'Pagado' },
			{
				id: 103,
				fecha: '2025-06-05',
				socio: 'Carlos Vives',
				concepto: 'Multa Minga',
				monto: 10.0,
				estado: 'Pendiente',
			},
			{ id: 104, fecha: '2025-06-10', socio: 'Ana Gump', concepto: 'Instalación', monto: 50.0, estado: 'Pagado' },
			{ id: 105, fecha: '2025-06-15', socio: 'Pedro Pascal', concepto: 'Consumo Mayo', monto: 20.0, estado: 'Anulado' },
		];
		return of(mockData).pipe(delay(1000));
	}
}
