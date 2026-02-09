//src/app/core/services/billing.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { EstadoCuentaDTO, AbonoInput, AbonoOutput } from '../interfaces/billing.interface';
import { joinApiUrl } from '../utils/url';


export interface TransferenciaPendiente {
    pago_id: number;
    factura_id: number;
    socio: string;
    cedula: string;
    banco_fecha: string;
    monto: string; // Decimal string
    referencia: string;
    comprobante_url: string;
}

export interface ValidarTransferenciaRequest {
    pago_id: number;
    accion: 'APROBAR' | 'RECHAZAR';
}

export interface ValidarTransferenciaResponse {
    mensaje: string;
}

@Injectable({
    providedIn: 'root',
})
export class BillingService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    /**
     * Obtiene el estado de cuenta consolidado de un socio.
     * @param socioId ID del socio
     */
    getEstadoCuenta(socioId: number): Observable<EstadoCuentaDTO> {
        return this.http
            .get<EstadoCuentaDTO>(joinApiUrl(this.apiUrl, `billing/estado-cuenta/${socioId}`))
            .pipe(catchError(this.handleError));
    }

    /**
     * Procesa un pago (total o parcial) para un socio.
     * @param request Datos del pago
     */
    procesarPago(request: AbonoInput): Observable<AbonoOutput> {
        return this.http
            .post<AbonoOutput>(joinApiUrl(this.apiUrl, 'billing/pagar'), request)
            .pipe(catchError(this.handleError));
    }

    /**
     * Obtiene la lista de transferencias pendientes de validación (Tesorero).
     */
    getTransferenciasPendientes(): Observable<TransferenciaPendiente[]> {
        return this.http
            .get<TransferenciaPendiente[]>(joinApiUrl(this.apiUrl, 'cobros/pendientes-validacion'))
            .pipe(catchError(this.handleError));
    }

    /**
     * Valida (Aprueba/Rechaza) una transferencia pendiente.
     */
    validarTransferencia(payload: ValidarTransferenciaRequest): Observable<ValidarTransferenciaResponse> {
        return this.http
            .post<ValidarTransferenciaResponse>(joinApiUrl(this.apiUrl, 'cobros/validar-transferencia'), payload)
            .pipe(catchError(this.handleError));
    }


    /**
     * Descarga el PDF (RIDE) de una factura.
     * @param facturaId ID de la factura
     */
    downloadFacturaPdf(facturaId: number): Observable<Blob> {
        return this.http
            .get(joinApiUrl(this.apiUrl, `facturas/${facturaId}/pdf`), { responseType: 'blob' })
            .pipe(catchError(this.handleError));
    }


    /**
     * Normaliza errores de Django Rest Framework (DRF) a un string plano.
     * Soporta formatos:
     * - { field: ["Error 1", "Error 2"] }
     * - { detail: "Error genérico" }
     * - Array ["Error directo"]
     */
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'Ocurrió un error inesperado al procesar la solicitud.';

        if (error.error) {
            if (typeof error.error === 'string') {
                errorMessage = error.error; // Error plano
            } else if (error.error.detail) {
                errorMessage = error.error.detail; // Error genérico DRF
            } else if (typeof error.error === 'object') {
                // Errores de validación por campo (Field Errors)
                // Ej: { monto: ["Saldo insuficiente"], metodo: ["Requerido"] }
                const errors = Object.values(error.error).flat();
                if (errors.length > 0) {
                    errorMessage = errors.join('. ');
                }
            }
        }

        console.error('BillingService Error:', error);
        return throwError(() => new Error(errorMessage));
    }
}
