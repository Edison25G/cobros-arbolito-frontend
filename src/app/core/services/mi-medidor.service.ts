import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';

import { environment } from '../../environments/environment';
import { MedidorBackend, HistorialConsumo } from '../..//core/interfaces/mi-medidor';
import { LecturaView } from '../models/lectura.interface';

// IMPORTAMOS AUTH SERVICE (Es vital para saber quién está logueado)
import { AuthService } from '../../core/services/auth.service';

@Injectable({
	providedIn: 'root',
})
export class MedidorService {
	private http = inject(HttpClient);
	private authService = inject(AuthService);

	private apiUrl = `${environment.apiUrl}/medidores/`;
	private lecturasUrl = `${environment.apiUrl}/lecturas/`;

	// Nombres de meses en español
	private meses = [
		'Enero',
		'Febrero',
		'Marzo',
		'Abril',
		'Mayo',
		'Junio',
		'Julio',
		'Agosto',
		'Septiembre',
		'Octubre',
		'Noviembre',
		'Diciembre',
	];

	getMedidorDelSocioLogueado(): Observable<MedidorBackend | undefined> {
		const token = localStorage.getItem('token');
		const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;

		// Llamamos a la nueva ruta /mi-medidor/ que es segura y directa
		return this.http.get<MedidorBackend>(`${this.apiUrl}mi-medidor/`, { headers }).pipe(
			catchError((error) => {
				console.error('Error obteniendo medidor del socio:', error);
				return of(undefined);
			}),
		);
	}

	/**
	 * Obtiene el historial de consumo REAL desde el backend
	 * Filtra las lecturas por código de medidor y transforma al formato del gráfico
	 */
	getHistorialConsumo(codigoMedidor?: string): Observable<HistorialConsumo[]> {
		const token = localStorage.getItem('token');
		const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;

		return this.http.get<LecturaView[]>(this.lecturasUrl, { headers }).pipe(
			map((lecturas) => {
				// Filtramos por el medidor del usuario si se proporciona el código
				let lecturasDelMedidor = lecturas;
				if (codigoMedidor) {
					lecturasDelMedidor = lecturas.filter((l) => l.medidor_codigo === codigoMedidor);
				}

				// Ordenamos por fecha (más antigua primero)
				lecturasDelMedidor.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

				// Tomamos los últimos 6 registros
				const ultimas6 = lecturasDelMedidor.slice(-6);

				// Transformamos al formato HistorialConsumo
				return ultimas6.map((lectura) => {
					const fecha = new Date(lectura.fecha);
					return {
						mes: this.meses[fecha.getMonth()],
						anio: fecha.getFullYear(),
						consumo: lectura.consumo,
					};
				});
			}),
			catchError(() => {
				// Si falla, devolvemos array vacío
				return of([]);
			}),
		);
	}
}
