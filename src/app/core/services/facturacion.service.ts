import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LecturaPendiente, GenerarEmisionDTO } from '../interfaces/factura.interface';

@Injectable({
	providedIn: 'root',
})
export class FacturacionService {
	private http = inject(HttpClient);
	private apiUrl = environment.apiUrl;

	// ✅ 1. PRE-EMISIÓN: Esta es la que llena la tabla vacía
	getPreEmision(): Observable<LecturaPendiente[]> {
		const url = `${this.apiUrl}/facturas-gestion/pre-emision/`;

		return this.http.get<any[]>(url).pipe(
			// Mapeamos los nombres del Backend a los de tu Interfaz Frontend
			map((response) =>
				response.map((item) => ({
					id: item.lectura_id,
					socio_nombre: item.socio,
					medidor_codigo: item.codigo_medidor,
					lectura_anterior: Number(item.lectura_anterior),
					lectura_actual: Number(item.lectura_actual),
					consumo: Number(item.consumo),
					monto_agua: Number(item.valor_estimado),
					multas_mingas: 0, // Por ahora 0, luego lo conectas
					total_pagar: Number(item.valor_estimado),
					cedula: '---', // Opcional si el backend no lo manda aún
				})),
			),
			catchError(this.handleError),
		);
	}

	// 2. GENERAR EMISIÓN (Botón Verde)
	generarEmisionMasiva(datos: GenerarEmisionDTO): Observable<any> {
		return this.http.post(`${this.apiUrl}/facturas-gestion/emision-masiva/`, datos).pipe(catchError(this.handleError));
	}

	// Manejo de errores estándar
	private handleError(error: HttpErrorResponse) {
		console.error('Error:', error);
		return throwError(() => new Error(error.error?.error || 'Error desconocido'));
	}

	// FacturacionService
	getFacturasPorSocio(cedula: string): Observable<any[]> {
		const url = `${this.apiUrl}/facturas-gestion/pendientes/?cedula=${cedula}`;
		return this.http.get<any>(url).pipe(
			// El backend v4 a veces devuelve {mensaje: '...', data: []}
			// o el array directo. Manejamos ambos:
			map((res) => (Array.isArray(res) ? res : res.data)),
			catchError(this.handleError),
		);
	}
}
