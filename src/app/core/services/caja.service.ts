import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
	RegistrarPagoDTO,
	PagoResponse,
	TransferenciaPendiente,
	RegistrarCobroDTO,
	CobroResponse,
	FacturaPendiente,
} from '../interfaces/caja.interface';

@Injectable({
	providedIn: 'root',
})
export class CajaService {
	private http = inject(HttpClient);
	// Asegúrate de que environment.apiUrl apunte a http://localhost:8000/api/v1
	private apiUrl = environment.apiUrl;

	/**
	 * 1. Registrar el cobro en la base de datos (método antiguo)
	 * Endpoint: POST /api/v1/caja/pagar/
	 */
	procesarPago(ids: number[], metodo: 'EFECTIVO' | 'TRANSFERENCIA'): Observable<PagoResponse> {
		// Aquí hardcodeamos el usuario_id: 1 hasta que tengas el Login listo
		const payload: RegistrarPagoDTO = {
			deudas_ids: ids,
			metodo_pago: metodo,
			usuario_id: 1,
		};
		return this.http.post<PagoResponse>(`${this.apiUrl}/caja/pagar/`, payload).pipe(catchError(this.handleError));
	}

	/**
	 * 3. Obtener transferencias pendientes de aprobar
	 * Endpoint: GET /api/v1/caja/transferencias-pendientes/
	 */
	getTransferenciasPendientes(): Observable<TransferenciaPendiente[]> {
		return this.http
			.get<TransferenciaPendiente[]>(`${this.apiUrl}/caja/transferencias-pendientes/`)
			.pipe(catchError(this.handleError));
	}

	/**
	 * 4. NUEVO: Registrar cobro con pagos mixtos
	 * Endpoint: POST /api/v1/cobros/registrar/
	 *
	 * Permite cobrar una factura con múltiples métodos de pago
	 * Ejemplo: parte en efectivo y parte en transferencia
	 */
	registrarCobro(datos: RegistrarCobroDTO): Observable<CobroResponse> {
		return this.http.post<CobroResponse>(`${this.apiUrl}/cobros/registrar/`, datos).pipe(catchError(this.handleError));
	}

	/**
	 * 5. Buscar facturas pendientes de cobro
	 * Endpoint: GET /api/v1/cobros/pendientes/?q=cedula_o_nombre&dia=12&mes=1&anio=2026
	 *
	 * Busca las facturas pendientes, opcionalmente filtradas por socio y/o fecha
	 * @param q - Cédula o nombre del socio (opcional)
	 * @param dia - Día de la factura (1-31, opcional)
	 * @param mes - Mes de la factura (1-12, opcional)
	 * @param anio - Año de la factura (opcional)
	 */
	getFacturasPendientes(q?: string, dia?: number, mes?: number, anio?: number): Observable<FacturaPendiente[]> {
		let url = `${this.apiUrl}/cobros/pendientes/`;
		const params: string[] = [];

		if (q) {
			params.push(`q=${encodeURIComponent(q)}`);
		}
		if (dia) {
			params.push(`dia=${dia}`);
		}
		if (mes) {
			params.push(`mes=${mes}`);
		}
		if (anio) {
			params.push(`anio=${anio}`);
		}

		if (params.length > 0) {
			url += '?' + params.join('&');
		}

		return this.http.get<FacturaPendiente[]>(url).pipe(catchError(this.handleError));
	}

	private handleError(error: HttpErrorResponse) {
		console.error('Error en CajaService:', error);
		let msg = 'Error de conexión o servidor.';

		if (error.status === 404) {
			msg = 'No se encontraron facturas pendientes.';
		} else if (error.error && error.error.error) {
			msg = error.error.error;
		}

		return throwError(() => new Error(msg));
	}
}
