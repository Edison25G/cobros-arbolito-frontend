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
	private apiUrl = environment.apiUrl;

	// 1. Registrar pago (Método antiguo - quizas ya no lo uses, pero lo dejo por si acaso)
	procesarPago(ids: number[], metodo: 'EFECTIVO' | 'TRANSFERENCIA'): Observable<PagoResponse> {
		const payload: RegistrarPagoDTO = {
			deudas_ids: ids,
			metodo_pago: metodo,
			usuario_id: 1,
		};
		return this.http.post<PagoResponse>(`${this.apiUrl}/caja/pagar/`, payload).pipe(catchError(this.handleError));
	}

	// 3. Obtener transferencias (Si lo usas)
	getTransferenciasPendientes(): Observable<TransferenciaPendiente[]> {
		return this.http
			.get<TransferenciaPendiente[]>(`${this.apiUrl}/caja/transferencias-pendientes/`)
			.pipe(catchError(this.handleError));
	}

	// 4. NUEVO: Registrar cobro (Este es el que usa el RegistrarCobroUseCase)
	registrarCobro(datos: RegistrarCobroDTO): Observable<CobroResponse> {
		// Asegúrate de que la ruta sea exactamente esta para que coincida con el router de Django
		return this.http.post<CobroResponse>(`${this.apiUrl}/cobros/registrar/`, datos).pipe(catchError(this.handleError));
	}

	/**
	 * 5. BUSCAR DEUDAS PENDIENTES (CORREGIDO)
	 * Se agrega la lógica para 'dia' para evitar el error TS6133
	 */
	getFacturasPendientes(q?: string, dia?: number, mes?: number, anio?: number): Observable<FacturaPendiente[]> {
		// Apuntamos al endpoint correcto
		let url = `${this.apiUrl}/facturas-gestion/pendientes/`;

		const params: string[] = [];

		if (q) {
			// Backend espera 'cedula'
			params.push(`cedula=${encodeURIComponent(q)}`);
		}

		// ✅ CORRECCIÓN: Ahora sí usamos la variable 'dia'
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
		} else if (error.error && error.error.mensaje) {
			msg = error.error.mensaje;
		}

		return throwError(() => new Error(msg));
	}
}
