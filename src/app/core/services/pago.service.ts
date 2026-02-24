import { Injectable, inject } from '@angular/core';
// ✅ CORREGIDO: Eliminamos HttpHeaders porque no se usa
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FacturaSocio, EstadoFactura } from '../models/pago.interface';

@Injectable({
	providedIn: 'root',
})
export class PagoService {
	private http = inject(HttpClient);
	private apiUrl = environment.apiUrl;

	getFacturasDelSocioLogueado(): Observable<FacturaSocio[]> {
		// 🔥 CORRECCIÓN CRÍTICA: La ruta real de tu backend es /facturas/pendientes/
		const url = `${this.apiUrl}/facturas/pendientes/`;

		return this.http.get<any>(url).pipe(
			map((response) => {
				const data = Array.isArray(response) ? response : response.data || response.facturas || [];
				return data.map((item: any) => ({
					id: item.factura_id || item.id,
					fecha_emision: item.fecha_emision,
					fecha_vencimiento: item.fecha_vencimiento,
					total: Number(item.total || 0),
					estado: (item.estado || item.estado_pago) as EstadoFactura,
					clave_acceso_sri: item.clave_acceso_sri,
					socio: item.socio
						? {
								nombres: typeof item.socio === 'string' ? item.socio : item.socio.nombres,
								apellidos: '',
								identificacion: item.identificacion || item.cedula || '',
								direccion: item.direccion,
							}
						: undefined,
					detalle: item.lectura
						? {
								lectura_anterior: Number(item.lectura.lectura_anterior || 0),
								lectura_actual: Number(item.lectura.valor || item.lectura.lectura_actual || 0),
								consumo_total: Number(item.lectura.consumo_del_mes || 0),
								costo_base: 0,
							}
						: undefined,
				}));
			}),
			catchError((error: HttpErrorResponse) => {
				if (error.status === 404) {
					return of([]);
				}
				// Llamamos a this.handleError
				return this.handleError(error);
			}),
		);
	}

	subirComprobante(facturaId: number, monto: number, archivo: File, referencia: string): Observable<any> {
		const formData = new FormData();
		formData.append('factura_id', facturaId.toString());
		formData.append('monto', monto.toString());
		formData.append('referencia', referencia);
		formData.append('comprobante', archivo);

		// ✅ URL CORRECTA con el "/" al final para evitar el error 500 de Django
		const url = `${this.apiUrl}/cobros/subir_comprobante/`;

		return this.http.post(url, formData).pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
	}

	/**
	 * ✅ MÉTODO DE MANEJO DE ERRORES
	 */
	private handleError(error: HttpErrorResponse) {
		console.error('Error en PagoService:', error);

		let mensajeError = 'Error al procesar la solicitud';

		if (error.error && typeof error.error === 'object') {
			// DRF suele mandar los errores en un formato dict
			mensajeError = error.error.error || error.error.detail || error.error.mensaje || mensajeError;
		}

		return throwError(() => new Error(mensajeError));
	}
}
