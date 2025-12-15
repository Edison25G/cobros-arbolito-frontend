import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { Medidor } from '../models/medidor.interface';
import { Socio } from '../models/socio.interface'; // Importamos la interfaz Socio
import { SocioService } from './socio.service'; // Importamos el servicio de Socios

@Injectable({
	providedIn: 'root',
})
export class MedidorService {
	private http = inject(HttpClient);
	private socioService = inject(SocioService); // Inyectamos el servicio de socios

	// URL del Backend
	private baseUrl = `${environment.apiUrl}/medidores/`;

	constructor() {}

	/**
	 * 1. LISTAR MEDIDORES (Con "Join" de Frontend)
	 * Trae medidores y socios al mismo tiempo y los une.
	 */
	getMedidores(): Observable<Medidor[]> {
		const medidores$ = this.http.get<Medidor[]>(this.baseUrl);
		const socios$ = this.socioService.getSocios();

		return forkJoin([medidores$, socios$]).pipe(
			map(([medidores, socios]) => {
				return medidores.map((medidor) => {
					// Buscamos el socio dueño de este medidor por ID
					const socioEncontrado = socios.find((s) => s.id === medidor.socio_id);
					return {
						...medidor,
						socio_data: socioEncontrado, // Rellenamos el dato extra para la tabla
					};
				});
			}),
			catchError(this.handleError),
		);
	}

	/**
	 * 2. OBTENER UN MEDIDOR POR ID
	 */
	getMedidorById(id: number): Observable<Medidor> {
		return this.http.get<Medidor>(`${this.baseUrl}${id}/`).pipe(catchError(this.handleError));
	}

	/**
	 * 3. CREAR MEDIDOR
	 */
	createMedidor(medidorData: any): Observable<Medidor> {
		// Aseguramos enviar 'socio_id' al backend
		const payload = {
			...medidorData,
			socio_id: medidorData.socio || medidorData.socio_id,
		};
		return this.http.post<Medidor>(this.baseUrl, payload).pipe(catchError(this.handleError));
	}

	/**
	 * 4. ACTUALIZAR MEDIDOR
	 */
	updateMedidor(id: number, medidorData: any): Observable<Medidor> {
		const payload = {
			...medidorData,
			...(medidorData.socio && { socio_id: medidorData.socio }),
		};
		return this.http.patch<Medidor>(`${this.baseUrl}${id}/`, payload).pipe(catchError(this.handleError));
	}

	/**
	 * 5. ELIMINAR MEDIDOR
	 */
	deleteMedidor(id: number): Observable<void> {
		return this.http.delete<void>(`${this.baseUrl}${id}/`).pipe(catchError(this.handleError));
	}

	/**
	 * ✅ 6. OBTENER SOCIOS PARA EL DROPDOWN (EL QUE FALTABA)
	 * Simplemente reutiliza el servicio de socios que ya inyectamos.
	 */
	getSociosParaDropdown(): Observable<Socio[]> {
		return this.socioService.getSocios();
	}

	// Manejo de errores
	private handleError(error: HttpErrorResponse) {
		let errorMessage = 'Error desconocido';
		if (error.error) {
			errorMessage = JSON.stringify(error.error);
		}
		console.error('Backend Error:', error);
		return throwError(() => new Error(errorMessage));
	}
}
