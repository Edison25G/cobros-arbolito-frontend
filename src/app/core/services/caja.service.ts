import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
	EstadoCuentaResponse,
	RegistrarPagoDTO,
	PagoResponse,
	TransferenciaPendiente,
} from '../interfaces/caja.interface';

@Injectable({
	providedIn: 'root',
})
export class CajaService {
	private http = inject(HttpClient);
	// Asegúrate de que environment.apiUrl apunte a http://localhost:8000/api/v1
	private apiUrl = environment.apiUrl;

	/**
	 * 1. Buscar deudas de un socio por Cédula o Apellido
	 * Endpoint: GET /api/v1/caja/estado-cuenta/?termino=050123...
	 */
	buscarSocioConDeudas(termino: string): Observable<EstadoCuentaResponse> {
		const url = `${this.apiUrl}/caja/estado-cuenta/?termino=${termino}`;
		return this.http.get<EstadoCuentaResponse>(url).pipe(catchError(this.handleError));
	}

	/**
	 * 2. Registrar el cobro en la base de datos
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

	private handleError(error: HttpErrorResponse) {
		console.error('Error en CajaService:', error);
		let msg = 'Error de conexión o servidor.';

		if (error.status === 404) {
			msg = 'Socio no encontrado o sin deudas pendientes.';
		} else if (error.error && error.error.error) {
			msg = error.error.error;
		}

		return throwError(() => new Error(msg));
	}
}
