import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { ReporteCarteraItem, ReporteCierreCaja } from '../interfaces/reporte.interfaces';

@Injectable({
	providedIn: 'root',
})
export class ReporteService {
	private http = inject(HttpClient);
	private apiUrl = environment.apiUrl;

	// 1. Obtener Deudas (Para la tarjeta roja y naranja)
	getReporteCartera(): Observable<ReporteCarteraItem[]> {
		return this.http.get<ReporteCarteraItem[]>(`${this.apiUrl}/analytics/cartera-vencida/`);
	}

	// 2. Obtener Recaudación (Para la tarjeta verde y el gráfico)
	getCierreCaja(inicio: Date, fin: Date): Observable<ReporteCierreCaja> {
		const params = new HttpParams()
			.set('fecha_inicio', inicio.toISOString().split('T')[0])
			.set('fecha_fin', fin.toISOString().split('T')[0]);

		return this.http.get<ReporteCierreCaja>(`${this.apiUrl}/analytics/cierre-caja/`, { params });
	}
}
