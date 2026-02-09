import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
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
import { joinApiUrl } from '../utils/url';

@Injectable({
	providedIn: 'root',
})
export class CajaService {
	private http = inject(HttpClient);
	private apiUrl = environment.apiUrl;

	getTransferenciasPendientes(): Observable<TransferenciaPendiente[]> {
		return this.http
			.get<TransferenciaPendiente[]>(joinApiUrl(this.apiUrl, 'cobros/pendientes-validacion'))
			.pipe(catchError(this.handleError));
	}

	validarTransferencia(pagoId: number, accion: 'APROBAR' | 'RECHAZAR'): Observable<any> {
		return this.http
			.post(joinApiUrl(this.apiUrl, 'cobros/validar-transferencia'), {
				pago_id: pagoId,
				accion: accion,
			})
			.pipe(catchError(this.handleError));
	}

	registrarCobro(datos: RegistrarCobroDTO): Observable<CobroResponse> {
		return this.http.post<CobroResponse>(joinApiUrl(this.apiUrl, 'cobros/registrar'), datos).pipe(catchError(this.handleError));
	}

	getFacturasPendientes(q?: string, dia?: number, mes?: number, anio?: number): Observable<FacturaPendiente[]> {
		let url = joinApiUrl(this.apiUrl, 'facturas-gestion/pendientes');
		const params: string[] = [];

		if (q) params.push(`identificacion=${encodeURIComponent(q)}`);
		if (dia) params.push(`dia=${dia}`);
		if (mes) params.push(`mes=${mes}`);
		if (anio) params.push(`anio=${anio}`);

		if (params.length > 0) {
			url += '?' + params.join('&');
		}

		return this.http.get<FacturaPendiente[]>(url).pipe(catchError(this.handleError));
	}

	procesarPago(ids: number[], metodo: 'EFECTIVO' | 'TRANSFERENCIA'): Observable<PagoResponse> {
		const payload: RegistrarPagoDTO = {
			deudas_ids: ids,
			metodo_pago: metodo,
			usuario_id: 1,
		};
		return this.http.post<PagoResponse>(joinApiUrl(this.apiUrl, 'caja/pagar'), payload).pipe(catchError(this.handleError));
	}

	private handleError(error: HttpErrorResponse) {
		console.error('Error en CajaService:', error);
		let msg = 'Error de conexión o servidor.';

		if (error.status === 404) {
			msg = 'No se encontraron registros.';
		} else if (error.error && error.error.error) {
			msg = error.error.error;
		} else if (error.error && error.error.mensaje) {
			msg = error.error.mensaje;
		}

		return throwError(() => new Error(msg));
	}

	getPagosFactura(facturaId: number): Observable<any[]> {
		return this.http.get<any[]>(joinApiUrl(this.apiUrl, `cobros/${facturaId}/pagos`));
	}
}
