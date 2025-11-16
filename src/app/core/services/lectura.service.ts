import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { RegistrarLecturaDTO, LecturaResponse } from '../models/lectura.interface';

@Injectable({
	providedIn: 'root',
})
export class LecturaService {
	private http = inject(HttpClient);

	// URL base de la API (ej: http://localhost:8000/api/v1)
	private apiUrl = environment.apiUrl;

	/**
	 * Llama a la API real para registrar una nueva lectura.
	 * POST /api/v1/lecturas/registrar/
	 */
	registrarLectura(data: RegistrarLecturaDTO): Observable<LecturaResponse> {
		const url = `${this.apiUrl}/lecturas/registrar/`;
		return this.http.post<LecturaResponse>(url, data).pipe(catchError(this.handleError));
	}

	private handleError(error: HttpErrorResponse) {
		let errorMessage = 'Ocurrió un error desconocido.';

		if (error.status === 0) {
			errorMessage = 'Error de Conexión. ¿El servidor de Django (backend) está corriendo?';
		} else if (error.status === 400 && error.error) {
			// Errores de validación (ej: "Lectura actual no puede ser menor a la anterior")
			errorMessage = error.error.error || 'Error en los datos enviados.';
		} else if (error.status === 404) {
			errorMessage = 'El Medidor no fue encontrado en el backend (Error 404).';
		} else if (error.status === 403) {
			errorMessage = 'No tienes permisos (Token JWT) para realizar esta acción.';
		}

		console.error(error);
		return throwError(() => new Error(errorMessage));
	}
}
