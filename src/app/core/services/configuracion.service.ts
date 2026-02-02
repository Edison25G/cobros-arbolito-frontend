import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Configuracion } from '../interfaces/configuracion.interface';

@Injectable({
	providedIn: 'root',
})
export class ConfiguracionService {
	private http = inject(HttpClient);
	private apiUrl = environment.apiUrl; // http://localhost:8000/api/v1

	/**
	 * Obtener la configuración única del sistema
	 * GET /api/v1/configuracion/
	 */
	getConfiguracion(): Observable<Configuracion> {
		return this.http.get<Configuracion>(`${this.apiUrl}/configuracion/`);
	}

	/**
	 * Actualizar la configuración
	 * PUT /api/v1/configuracion/
	 */
	updateConfiguracion(config: Configuracion): Observable<Configuracion> {
		// Nota: Usualmente el backend devuelve el objeto actualizado, no { success: true }
		// Si tu backend devuelve { success: true }, avísame para ajustar.
		// Por estándar REST, suele devolver el objeto modificado.
		return this.http.put<Configuracion>(`${this.apiUrl}/configuracion/`, config);
	}
}
