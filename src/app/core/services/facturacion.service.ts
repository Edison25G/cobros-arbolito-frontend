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
	getFacturasPorSocio(identificacion: string, verTodo = false): Observable<any[]> {
		// 1. Construimos la URL base
		let url = `${this.apiUrl}/facturas-gestion/pendientes/?identificacion=${identificacion}`;

		// 2. Si la bandera es true (Perfil Socio), agregamos el parámetro mágico
		if (verTodo) {
			url += '&ver_historial=true';
		}

		// 3. Hacemos la petición con los operadores RxJS correctos
		return this.http.get<any>(url).pipe(
			map((res) => {
				// Validación para soportar respuestas { data: [...] } o [...] directo
				return Array.isArray(res) ? res : res.data;
			}),
			catchError((err) => {
				console.error('Error fetching facturas:', err);
				return throwError(() => err);
			}),
		);
	}

	consultarSRI(claveAcceso: string): Observable<any> {
		// Cambiamos 'facturas-gestion/consultar-autorizacion/' por 'facturas/consultar/'
		return this.http.get(`${this.apiUrl}/facturas/consultar/`, {
			params: { clave_acceso: claveAcceso },
		});
	}
}
