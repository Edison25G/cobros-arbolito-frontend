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
	 * Obtiene las facturas reales del socio logueado directamente desde el Backend
	 */
	getFacturasDelSocioLogueado(): Observable<FacturaSocio[]> {
		const url = `${this.apiUrl}/mis-facturas/`;

		return this.http.get<any>(url).pipe(
			map((response) => {
				// ✅ ACCEDEMOS A LA PROPIEDAD 'facturas' DEL JSON
				const data = response.facturas || [];

				return data.map((item: any) => ({
					id: item.id,
					fecha_emision: item.fecha_emision,
					fecha_vencimiento: item.fecha_vencimiento,
					total: Number(item.total || 0),
					estado: item.estado as EstadoFactura,
					clave_acceso_sri: item.clave_acceso_sri,
					socio: item.socio
						? {
								nombres: item.socio.nombres,
								apellidos: item.socio.apellidos,
								cedula: item.socio.cedula,
								direccion: item.socio.direccion,
							}
						: undefined,
					detalle: item.detalle
						? {
								lectura_anterior: Number(item.detalle.lectura_anterior || 0),
								lectura_actual: Number(item.detalle.lectura_actual || 0),
								consumo_total: Number(item.detalle.consumo_total || 0),
								costo_base: Number(item.detalle.costo_base || 0),
							}
						: undefined,
				}));
			}),
			catchError(this.handleError),
		);
	}

	/**
	 * Sube un comprobante de pago real
	 */
	subirComprobante(facturaId: number, archivo: File): Observable<any> {
		const formData = new FormData();
		formData.append('comprobante', archivo);

		return this.http
			.post(`${this.apiUrl}/facturas/${facturaId}/subir-pago/`, formData)
			.pipe(catchError(this.handleError));
	}

	// Manejo de errores igual al de tu facturacion.service.ts
	private handleError(error: HttpErrorResponse) {
		console.error('Error en PagoService:', error);
		return throwError(() => new Error(error.error?.error || 'Error al procesar el pago'));
	}
}
