import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';

// Interfaces Actualizadas
import { Medidor } from '../models/medidor.interface';
import { Socio } from '../models/socio.interface';
import { SocioService } from './socio.service';

@Injectable({
	providedIn: 'root',
})
export class MedidorService {
	private http = inject(HttpClient);
	private socioService = inject(SocioService);

	// URL del Backend
	private baseUrl = `${environment.apiUrl}/medidores/`;

	constructor() {}

	/**
	 * 1. LISTAR MEDIDORES
	 * ✅ CAMBIO IMPORTANTE: Quitamos el "forkJoin".
	 * Ahora esperamos que el Backend nos envíe el medidor con los datos del terreno/socio
	 * usando un Serializer anidado (depth=1 o 2 en Django).
	 */
	getMedidores(): Observable<Medidor[]> {
		return this.http.get<Medidor[]>(this.baseUrl).pipe(catchError(this.handleError));
	}

	/**
	 * 2. OBTENER UN MEDIDOR POR ID
	 */
	getMedidorById(id: number): Observable<Medidor> {
		return this.http.get<Medidor>(`${this.baseUrl}${id}/`).pipe(catchError(this.handleError));
	}

	/**
	 * 3. CREAR MEDIDOR
	 * Aquí recibimos los datos del formulario.
	 * NOTA: Si tu formulario envía 'socio_id', el backend tendrá que ser inteligente
	 * para buscar el terreno de ese socio, o el formulario deberá enviar 'terreno_id'.
	 */
	createMedidor(medidorData: any): Observable<Medidor> {
		return this.http.post<Medidor>(this.baseUrl, medidorData).pipe(catchError(this.handleError));
	}

	/**
	 * 4. ACTUALIZAR MEDIDOR
	 */
	updateMedidor(id: number, medidorData: any): Observable<Medidor> {
		return this.http.patch<Medidor>(`${this.baseUrl}${id}/`, medidorData).pipe(catchError(this.handleError));
	}

	/**
	 * 5. ELIMINAR MEDIDOR
	 */
	deleteMedidor(id: number): Observable<void> {
		return this.http.delete<void>(`${this.baseUrl}${id}/`).pipe(catchError(this.handleError));
	}

	/**
	 * 6. OBTENER SOCIOS PARA EL DROPDOWN
	 * Mantenemos esto porque tu modal de "Gestión de Medidores"
	 * todavía necesita listar los socios para elegir dueño.
	 */
	getSociosParaDropdown(): Observable<Socio[]> {
		return this.socioService.getSocios();
	}

	// Manejo de errores estándar
	private handleError(error: HttpErrorResponse) {
		let errorMessage = 'Error desconocido';
		if (error.error) {
			// Intentamos mostrar el mensaje exacto que manda Django
			errorMessage = JSON.stringify(error.error).replace(/["{}]/g, '');
		}
		console.error('Backend Error:', error);
		return throwError(() => new Error(errorMessage));
	}
}
