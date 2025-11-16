import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, delay, map } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';

// Interfaces
import { GenerarFacturaDTO, FacturaGeneradaResponse, LecturaPendiente } from '../interfaces/factura.interface';

// Servicios (para crear datos simulados realistas)
import { MedidorService } from './medidor.service';
import { SocioService } from './socio.service';

@Injectable({
	providedIn: 'root',
})
export class FacturaService {
	private http = inject(HttpClient);
	private apiUrl = environment.apiUrl;

	// Inyectamos los otros servicios para crear un mock realista
	private medidorService = inject(MedidorService);
	private socioService = inject(SocioService);

	/**
	 * [SIMULADO] Obtiene una lista de lecturas pendientes de facturar.
	 * (En el futuro, esto debería ser una llamada real a una API
	 * ej: GET /api/v1/lecturas/?facturada=false)
	 */
	getLecturasPendientes(): Observable<LecturaPendiente[]> {
		// 1. Obtenemos medidores (simulados) y socios (reales)
		const medidores$ = this.medidorService.getMedidores(); // Ya vienen con socio_data

		return medidores$.pipe(
			map((medidores) => {
				// 2. Creamos "Lecturas Pendientes" falsas basadas en esos medidores
				const lecturasFalsas: LecturaPendiente[] = [];

				medidores.forEach((medidor, index) => {
					// Solo creamos lecturas para medidores físicos
					if (medidor.tiene_medidor_fisico && medidor.socio_data) {
						lecturasFalsas.push({
							id: 501 + index, // ID de la LECTURA (falso)
							fecha_lectura: '2025-11-10',
							consumo_del_mes_m3: 15 + index * 2, // Consumo falso
							medidor: medidor,
							socio: medidor.socio_data,
						});
					}
				});
				return lecturasFalsas;
			}),
			delay(800), // Simula tiempo de red
		);
	}

	/**
	 * [REAL] Llama a la API para generar una factura desde una lectura.
	 * POST /api/v1/facturas/generar/
	 */
	generarFactura(dto: GenerarFacturaDTO): Observable<FacturaGeneradaResponse> {
		const url = `${this.apiUrl}/facturas/generar/`;
		return this.http.post<FacturaGeneradaResponse>(url, dto).pipe(catchError(this.handleError));
	}

	private handleError(error: HttpErrorResponse) {
		let errorMessage = 'Ocurrió un error desconocido.';
		if (error.status === 0) {
			errorMessage = 'Error de Conexión. ¿El servidor de Django (backend) está corriendo?';
		} else if (error.status === 400 && error.error) {
			errorMessage = error.error.error || 'Error en los datos enviados.';
		} else if (error.status === 404) {
			errorMessage = 'API no encontrada (404). Revisa la URL.';
		} else if (error.status === 403) {
			errorMessage = 'No tienes permisos (Token JWT) para esta acción.';
		}
		console.error(error);
		return throwError(() => new Error(errorMessage));
	}
}
