import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../environments/environment.development';

// Importamos las interfaces desde la ruta correcta
import { ReporteGeneral, FacturaReporte } from '../interfaces/reporte.interfaces';

// ¡CORRECCIÓN! Añadimos 'export'
@Injectable({
	providedIn: 'root',
})
export class ReporteService {
	// private http = inject(HttpClient); // Comentado (API no lista)
	private apiUrl = environment.apiUrl;

	constructor() {}

	/**
	 * 1. PARA EL "HOME" (Resumen) - SIMULADO
	 */
	getReporteGeneral(): Observable<ReporteGeneral> {
		// const url = `${this.apiUrl}/reportes/general/`;

		// ¡SIMULADO!
		return of({
			sociosActivos: 124, // Este dato sí lo podríamos sacar de 'socio.service.ts'
			sociosEnMora: 15,
			totalRecaudadoMes: 4250.5,
			totalDeuda: 850.0,
			recaudacionUltimos6Meses: [3000, 3500, 3200, 4100, 3900, 4250],
		}).pipe(delay(1000));
	}

	/**
	 * 2. ¡NUEVO! PARA LA PÁGINA "REPORTES" (Interactivo) - SIMULADO
	 * (Añadimos _ para que no dé error de "no usado")
	 */
	getReporteFacturacion(_fechaInicio: string, _fechaFin: string): Observable<FacturaReporte[]> {
		// const url = `${this.apiUrl}/reportes/facturacion/`;
		// let params = new HttpParams();
		// params = params.append('fecha_inicio', fechaInicio);
		// params = params.append('fecha_fin', fechaFin);

		// ¡SIMULADO!
		const mockData: FacturaReporte[] = [
			{
				id: 1,
				fecha_emision: '2025-10-01',
				fecha_vencimiento: '2025-11-01',
				socio_nombres: 'Juan',
				socio_apellidos: 'Perez',
				socio_cedula: '0501234567',
				total: 3.5,
				estado: 'Pagada',
				clave_acceso_sri: '123...',
			},
			{
				id: 2,
				fecha_emision: '2025-10-02',
				fecha_vencimiento: '2025-11-02',
				socio_nombres: 'Maria',
				socio_apellidos: 'Gomez',
				socio_cedula: '0509876543',
				total: 5.0,
				estado: 'Pendiente',
				clave_acceso_sri: null,
			},
			{
				id: 3,
				fecha_emision: '2025-10-03',
				fecha_vencimiento: '2025-11-03',
				socio_nombres: 'Pedro',
				socio_apellidos: 'Andrade',
				socio_cedula: '0501112223',
				total: 3.5,
				estado: 'Anulada',
				clave_acceso_sri: null,
			},
		];
		return of(mockData).pipe(delay(1000));
	}
}
