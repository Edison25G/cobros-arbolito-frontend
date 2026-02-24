import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LecturaPendiente } from '../interfaces/factura.interface';

@Injectable({
	providedIn: 'root',
})
export class FacturacionService {
	private http = inject(HttpClient);
	private apiUrl = environment.apiUrl;

	/**
	 * ✅ PRE-EMISIÓN: Mapeo corregido según el JSON de Django
	 * Django envía: nombres, lectura_anterior, lectura_actual, consumo, valor_agua, subtotal
	 */
	getPreEmision(): Observable<LecturaPendiente[]> {
		const url = `${this.apiUrl}/facturas-gestion/pre-emision/`;
		return this.http.get<LecturaPendiente[]>(url);
	}

	// 2. GENERAR EMISIÓN (Botón Verde)
	generarEmisionMasiva(datos: any): Observable<any> {
		// Al usar 'any' permitimos que pase la lista de lecturas sin que TS salte
		return this.http.post(`${this.apiUrl}/facturas-gestion/emision-masiva/`, datos).pipe(catchError(this.handleError));
	}

	// Manejo de errores estándar
	private handleError(error: HttpErrorResponse) {
		console.error('Error:', error);
		let mensaje = 'Error desconocido';
		if (error.error && error.error.error) {
			mensaje = error.error.error;
		}
		return throwError(() => new Error(mensaje));
	}

	// FacturacionService: Obtener facturas pendientes por socio
	getFacturasPorSocio(identificacion: string, verTodo = false): Observable<any[]> {
		let url = `${this.apiUrl}/facturas-gestion/pendientes/?identificacion=${identificacion}`;

		if (verTodo) {
			url += '&ver_historial=true';
		}

		return this.http.get<any>(url).pipe(
			map((res) => {
				return Array.isArray(res) ? res : res.data;
			}),
			catchError((err) => {
				console.error('Error fetching facturas:', err);
				return throwError(() => err);
			}),
		);
	}

	consultarSRI(claveAcceso: string): Observable<any> {
		return this.http.get(`${this.apiUrl}/facturas/consultar/`, {
			params: { clave_acceso: claveAcceso },
		});
	}
}
