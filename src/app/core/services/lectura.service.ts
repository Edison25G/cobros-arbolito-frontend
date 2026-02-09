import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { joinApiUrl } from '../utils/url';
import { RegistrarLecturaDTO, LecturaResponse, LecturaView } from '../models/lectura.interface';

@Injectable({
	providedIn: 'root',
})
export class LecturaService {
	private http = inject(HttpClient);
	private apiUrl = environment.apiUrl; // Asegúrate que esto apunte a localhost:8000/api/v1

	/**
	 * Registrar una nueva lectura (POST)
	 */
	registrarLectura(data: RegistrarLecturaDTO): Observable<LecturaResponse> {
		const url = joinApiUrl(this.apiUrl, 'lecturas');
		return this.http.post<LecturaResponse>(url, data).pipe(catchError(this.handleError));
	}

	/**
	 * Obtener historial real (GET)
	 * NOTA: Esto funcionará cuando tus compañeros creen el endpoint.
	 */
	getAll(): Observable<LecturaView[]> {
		// ⚠️ Confirma con tu equipo si la ruta será 'lecturas' o 'lecturas/historial'
		const url = joinApiUrl(this.apiUrl, 'lecturas');
		return this.http.get<LecturaView[]>(url).pipe(catchError(this.handleError));
	}

	private handleError(error: HttpErrorResponse) {
		let errorMessage = 'Ocurrió un error desconocido.';
		if (error.status === 0) {
			errorMessage = 'No hay conexión con el Backend (Django).';
		} else if (error.status === 400) {
			errorMessage = error.error.error || 'Datos incorrectos.';
		} else if (error.status === 404) {
			errorMessage = 'Recurso no encontrado.';
		}
		console.error('Error HTTP:', error);
		return throwError(() => new Error(errorMessage));
	}
}
