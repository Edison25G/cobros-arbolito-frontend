import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Socio } from '../models/socio.interface';

import { environment } from '../../environments/environment.development';

@Injectable({
	providedIn: 'root',
})
export class SocioService {
	private http = inject(HttpClient);

	private baseUrl = environment.apiUrl + '/socios/';

	getSocios(): Observable<Socio[]> {
		return this.http.get<Socio[]>(this.baseUrl).pipe(catchError(this.handleError));
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
		let errorMessage = 'Ocurrió un error desconocido.';

		if (error.status === 0) {
			errorMessage = 'Error de Conexión. ¿Está el servidor de Django (backend) corriendo en http://localhost:8000?';
		} else if (error.status === 400 && error.error) {
			try {
				const errors = error.error;
				const firstKey = Object.keys(errors)[0];
				const firstMessage = Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey];
				errorMessage = `Error de validación: ${firstMessage}`;
			} catch (_e) {
				errorMessage = `Error ${error.status}: ${error.message}`;
			}
		} else if (error.status === 404) {
			errorMessage = 'El API (http://localhost:8000/api/v1/socios/) no fue encontrado (Error 404). Revisa la URL.';
		} else if (error.status === 403) {
			errorMessage = 'No tienes permisos (IsAdminUser) para realizar esta acción. Necesitas un token JWT válido.';
		}

		console.error(error);
		return throwError(() => new Error(errorMessage));
	}
}
