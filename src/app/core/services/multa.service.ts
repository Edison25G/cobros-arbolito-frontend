import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { Multa, ImpugnarMultaDTO, ImpugnarMultaResponse } from '../interfaces/multa.interface';

@Injectable({
	providedIn: 'root',
})
export class MultaService {
	private http = inject(HttpClient);
	private apiUrl = environment.apiUrl;

	/**
	 * Obtener todas las multas (opcional - si el backend lo tiene)
	 */
	getAll(): Observable<Multa[]> {
		return this.http.get<Multa[]>(`${this.apiUrl}/multas/`).pipe(catchError(this.handleError));
	}

	/**
	 * Obtener multas de un socio específico
	 */
	getBySocio(socioId: number): Observable<Multa[]> {
		return this.http.get<Multa[]>(`${this.apiUrl}/multas/?socio_id=${socioId}`).pipe(catchError(this.handleError));
	}

	/**
	 * Impugnar o Rectificar una multa
	 * Endpoint: PATCH /api/v1/multas/{id}/impugnar/
	 *
	 * @param multaId - ID de la multa a impugnar
	 * @param datos - Acción a realizar (ANULAR o RECTIFICAR)
	 *
	 * Ejemplos de uso:
	 * - Anular: { accion: 'ANULAR', motivo: 'Error humano' }
	 * - Rectificar: { accion: 'RECTIFICAR', nuevo_monto: 5.00, motivo: 'Medio día' }
	 */
	impugnar(multaId: number, datos: ImpugnarMultaDTO): Observable<ImpugnarMultaResponse> {
		return this.http
			.patch<ImpugnarMultaResponse>(`${this.apiUrl}/multas/${multaId}/impugnar/`, datos)
			.pipe(catchError(this.handleError));
	}

	private handleError(error: HttpErrorResponse) {
		console.error('Error en MultaService:', error);
		let msg = 'Error desconocido en el servidor';

		if (error.status === 403) {
			msg = 'No tienes permisos para realizar esta acción.';
		} else if (error.status === 404) {
			msg = 'Multa no encontrada.';
		} else if (error.error && error.error.error) {
			msg = error.error.error;
		}

		return throwError(() => new Error(msg));
	}
}
