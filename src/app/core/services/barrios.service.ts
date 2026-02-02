import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Barrio, CrearBarrioDTO } from '../interfaces/barrio.interface'; // Ajusta la ruta de importación si es necesario

@Injectable({
	providedIn: 'root',
})
export class BarriosService {
	private http = inject(HttpClient);

	// URL base: http://localhost:8000/api/v1/barrios/
	private baseUrl = `${environment.apiUrl}/barrios/`;

	constructor() {}

	/**
	 * 1. LISTAR TODOS (GET /barrios/)
	 * Se usa para la tabla y para el dropdown de Lecturas.
	 */
	getBarrios(): Observable<Barrio[]> {
		return this.http.get<any>(this.baseUrl).pipe(
			map((response) => {
				if (response.results) {
					return response.results;
				}
				return Array.isArray(response) ? response : [response];
			}),
			catchError(this.handleError),
		);
	}

	/**
	 * 2. OBTENER UNO (GET /barrios/:id/)
	 */
	getBarrioById(id: number): Observable<Barrio> {
		return this.http.get<Barrio>(`${this.baseUrl}${id}/`).pipe(catchError(this.handleError));
	}

	/**
	 * 3. CREAR (POST /barrios/)
	 */
	createBarrio(barrio: CrearBarrioDTO): Observable<Barrio> {
		return this.http.post<Barrio>(this.baseUrl, barrio).pipe(catchError(this.handleError));
	}

	/**
	 * 4. ACTUALIZAR (PATCH /barrios/:id/)
	 * Usamos PATCH porque tu ViewSet soporta actualizaciones parciales.
	 */
	updateBarrio(id: number, barrio: Partial<Barrio>): Observable<Barrio> {
		return this.http.patch<Barrio>(`${this.baseUrl}${id}/`, barrio).pipe(catchError(this.handleError));
	}

	/**
	 * 5. ELIMINAR (DELETE /barrios/:id/)
	 */
	deleteBarrio(id: number): Observable<void> {
		return this.http.delete<void>(`${this.baseUrl}${id}/`).pipe(catchError(this.handleError));
	}

	// Manejo de errores estándar
	// Manejo de errores: PASAMOS EL ERROR COMPLETO
	private handleError(error: HttpErrorResponse) {
		// Solo lo mostramos en consola para depuración
		console.error('Error en BarriosService:', error);

		// ⚠️ CAMBIO CLAVE: Devolvemos el error original (HttpErrorResponse)
		// No creamos un "new Error()", porque eso borra el status 400.
		return throwError(() => error);
	}
}
