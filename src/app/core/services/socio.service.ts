import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Socio } from '../models/socio.interface';

// 1. ¡IMPORTANTE! Importamos tu archivo de entorno
// (Esta ruta asume que 'environments' está en 'src/environments/')
import { environment } from '../../environments/environment.development';

@Injectable({
	providedIn: 'root',
})
export class SocioService {
	private http = inject(HttpClient);

	// 2. ¡CORRECCIÓN! Construimos la URL base usando la variable de entorno
	//    tu environment: 'http://localhost:8000/api/v1'
	//    le añadimos: '/socios/'
	//    Resultado: 'http://localhost:8000/api/v1/socios/'
	private baseUrl = environment.apiUrl + '/socios/';

	/**
	 * Obtiene la lista completa de socios (GET http://localhost:8000/api/v1/socios/)
	 */
	getSocios(): Observable<Socio[]> {
		return this.http.get<Socio[]>(this.baseUrl).pipe(catchError(this.handleError));
	}

	/**
	 * Crea un nuevo socio (POST http://localhost:8000/api/v1/socios/)
	 */
	createSocio(socioData: any): Observable<Socio> {
		return this.http.post<Socio>(this.baseUrl, socioData).pipe(catchError(this.handleError));
	}

	/**
	 * Actualiza un socio (PATCH http://localhost:8000/api/v1/socios/<id>/)
	 */
	updateSocio(id: number, socioData: any): Observable<Socio> {
		return this.http.patch<Socio>(`${this.baseUrl}${id}/`, socioData).pipe(catchError(this.handleError));
	}

	/**
	 * Elimina (desactiva) un socio (DELETE http://localhost:8000/api/v1/socios/<id>/)
	 */
	deleteSocio(id: number): Observable<void> {
		return this.http.delete<void>(`${this.baseUrl}${id}/`).pipe(catchError(this.handleError));
	}

	/**
	 * Manejador de errores (Actualizado)
	 */
	private handleError(error: HttpErrorResponse) {
		let errorMessage = 'Ocurrió un error desconocido.';

		// Este es el error que probablemente verás si Django no está corriendo o si bloquea CORS
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
			// Este 404 ahora SÍ es del backend
			errorMessage = 'El API (http://localhost:8000/api/v1/socios/) no fue encontrado (Error 404). Revisa la URL.';
		} else if (error.status === 403) {
			errorMessage = 'No tienes permisos (IsAdminUser) para realizar esta acción. Necesitas un token JWT válido.';
		}

		console.error(error); // Mantenemos el log del error completo
		return throwError(() => new Error(errorMessage)); // Devolvemos el mensaje amigable
	}
}
