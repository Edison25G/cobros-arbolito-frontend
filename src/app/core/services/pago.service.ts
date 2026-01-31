import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FacturaSocio, EstadoFactura } from '../models/pago.interface';

@Injectable({
	providedIn: 'root',
})
export class PagoService {
	private http = inject(HttpClient);
	private apiUrl = environment.apiUrl;

	/**
	 * Obtiene las facturas reales del socio logueado
	 */
	getFacturasDelSocioLogueado(): Observable<FacturaSocio[]> {
		// Asegúrate de que esta URL coincida con tu endpoint de "Mis Facturas" o "Pendientes"
		const url = `${this.apiUrl}/mis-facturas/`;

		return this.http.get<any>(url).pipe(
			map((response) => {
				// Adaptamos la respuesta según venga {data: []} o []
				const data = Array.isArray(response) ? response : response.data || response.facturas || [];

				return data.map((item: any) => ({
					id: item.factura_id || item.id,
					fecha_emision: item.fecha_emision,
					fecha_vencimiento: item.fecha_vencimiento,
					total: Number(item.total || 0),

					// ✅ CORRECCIÓN 1: Casteamos explícitamente al Enum
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
			catchError(this.handleError),
		);
	}

	/**
	 * ✅ CORRECCIÓN 2: Agregué 'monto' a los argumentos
	 * Ahora recibe: ID, Monto, Archivo, Referencia
	 */
	subirComprobante(facturaId: number, monto: number, archivo: File, referencia: string): Observable<any> {
		const formData = new FormData();

		formData.append('factura_id', facturaId.toString());
		formData.append('monto', monto.toString()); // ✅ Enviamos el monto real
		formData.append('referencia', referencia);
		formData.append('comprobante', archivo);

		return this.http.post(`${this.apiUrl}/cobros/subir_comprobante/`, formData).pipe(catchError(this.handleError));
	}

	private handleError(error: HttpErrorResponse) {
		console.error('Error en PagoService:', error);
		return throwError(() => new Error(error.error?.error || 'Error al procesar la solicitud'));
	}
}
