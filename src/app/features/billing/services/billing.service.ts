import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { joinApiUrl } from '../../../core/utils/url';
import { EstadoCuentaResponse, PagoRequest, PagoResponse } from '../../../core/models/billing.models';

@Injectable({
    providedIn: 'root'
})
export class BillingService {
    // apiUrl será .../api/v1/billing/
    private apiUrl = joinApiUrl(environment.apiUrl, 'billing');

    constructor(private http: HttpClient) { }

    /**
     * Obtiene el estado de cuenta de un socio.
     * Endpoint: GET /api/v1/billing/estado-cuenta/{socio_id}/
     */
    obtenerEstadoCuenta(socioId: number): Observable<EstadoCuentaResponse> {
        // En billing service los sub-recursos también deben concatenarse con cuidado
        // joinApiUrl ya asegura el trailing slash en apiUrl, así que si concatenamos manualmente:
        // `${this.apiUrl}estado-cuenta/${socioId}/` -> .../billing/estado-cuenta/123/
        const url = `${this.apiUrl}estado-cuenta/${socioId}/`;
        return this.http.get<EstadoCuentaResponse>(url).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Procesa un pago/abono.
     * Endpoint: POST /api/v1/billing/pagar/
     */
    procesarPago(pago: PagoRequest): Observable<PagoResponse> {
        const url = `${this.apiUrl}pagar/`;
        return this.http.post<PagoResponse>(url, pago).pipe(
            catchError(this.handleError)
        );
    }

    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'Ocurrió un error desconocido.';
        if (error.error instanceof ErrorEvent) {
            // Error del lado del cliente
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Error del lado del servidor
            if (error.status === 404) {
                return throwError(() => new Error('Socio no encontrado (404).'));
            }
            if (error.status === 400 && error.error?.detail) {
                return throwError(() => new Error(error.error.detail));
            }
            errorMessage = `Código error: ${error.status}\nMensaje: ${error.message}`;
        }
        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}
