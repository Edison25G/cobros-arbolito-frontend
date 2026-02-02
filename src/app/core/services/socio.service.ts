import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Socio } from '../models/socio.interface';

import { environment } from '../../environments/environment';

@Injectable({
	providedIn: 'root',
})
export class SocioService {
	private http = inject(HttpClient);

	private baseUrl = environment.apiUrl + '/socios/';

	getSocios(): Observable<Socio[]> {
		return this.http.get<any>(this.baseUrl).pipe(
			map((response) => {
				// Si viene paginado (Django REST Framework por defecto devuelve { count, next, previous, results: [] })
				if (response.results) {
					return response.results;
				}
				// Si es un array directo
				return Array.isArray(response) ? response : [response];
			}),
			catchError(this.handleError),
		);
	}
	getSocioById(id: number): Observable<Socio> {
		return this.http.get<Socio>(`${this.baseUrl}${id}/`).pipe(catchError(this.handleError));
	}
	createSocio(socioData: any): Observable<Socio> {
		return this.http.post<Socio>(this.baseUrl, socioData).pipe(catchError(this.handleError));
	}

	updateSocio(id: number, socioData: any): Observable<Socio> {
		return this.http.patch<Socio>(`${this.baseUrl}${id}/`, socioData).pipe(catchError(this.handleError));
	}

	deleteSocio(id: number): Observable<void> {
		return this.http.delete<void>(`${this.baseUrl}${id}/`).pipe(catchError(this.handleError));
	}

	private handleError(error: HttpErrorResponse) {
		// Si es error de validación (400), lo devolvemos tal cual para que el componente lo maneje
		if (error.status === 400) {
			return throwError(() => error);
		}

		let errorMessage = 'Ocurrió un error desconocido.';
		if (error.status === 0) {
			errorMessage = 'Error de Conexión. Verifique su conexión a internet o el servidor.';
		} else if (error.status === 404) {
			errorMessage = 'Recurso no encontrado (404).';
		} else if (error.status === 403) {
			errorMessage = 'No tiene permisos para realizar esta acción.';
		} else {
			errorMessage = `Error ${error.status}: ${error.message}`;
		}

		console.error(error);
		return throwError(() => new Error(errorMessage));
	}
}
