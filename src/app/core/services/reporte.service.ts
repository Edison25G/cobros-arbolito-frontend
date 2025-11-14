import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';

// --- Interface para nuestros datos falsos ---
export interface ReporteGeneral {
	sociosActivos: number;
	sociosEnMora: number;
	totalRecaudadoMes: number;
	totalDeuda: number;
	// Datos para una gráfica [Ene, Feb, Mar, Abr, May, Jun]
	recaudacionUltimos6Meses: number[];
}

@Injectable({
	providedIn: 'root',
})
export class ReporteService {
	constructor() {}

	/**
	 * Simula una llamada API para obtener los datos del reporte.
	 * Tarda 800ms en responder (los reportes suelen ser más lentos).
	 */
	getReporteGeneral(): Observable<ReporteGeneral> {
		console.log('ReporteService: Simulando cálculo de reportes...');

		// Simulamos una espera de 800ms
		return timer(800).pipe(
			map(() => {
				console.log('ReporteService: Reportes simulados listos.');
				// Devolvemos nuestros datos falsos
				return {
					sociosActivos: 124,
					sociosEnMora: 18,
					totalRecaudadoMes: 3850.75,
					totalDeuda: 980.2,
					recaudacionUltimos6Meses: [1500, 2100, 1800, 2500, 2200, 3850],
				};
			}),
		);
	}
}
