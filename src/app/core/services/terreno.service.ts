import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

// ✅ Importamos la interfaz para que el código sea inteligente
import { Terreno } from '../../core/interfaces/terreno.interface';

@Injectable({
	providedIn: 'root',
})
export class TerrenoService {
	private http = inject(HttpClient);
	private apiUrl = `${environment.apiUrl}/terrenos/`;

	constructor() {}

	// 1. Obtener terrenos (Devuelve un array de Terrenos, no 'any')
	getTerrenosPorSocio(socioId: number): Observable<Terreno[]> {
		return this.http.get<Terreno[]>(`${this.apiUrl}?socio_id=${socioId}`);
	}

	/**
	 * 2. Crear un nuevo terreno
	 * NOTA: Aquí el backend espera recibir:
	 * {
	 * "socio_id": 1,
	 * "barrio_id": 5,  <-- OJO: ID numérico, no el nombre
	 * "direccion": "Frente a la escuela",
	 * "codigo_medidor": "MED-001" (Opcional, si tu backend lo soporta en el mismo endpoint)
	 * }
	 */
	createTerreno(datos: Partial<Terreno> & { codigo_medidor?: string }): Observable<Terreno> {
		return this.http.post<Terreno>(this.apiUrl, datos);
	}

	// 3. Editar terreno
	updateTerreno(id: number, datos: any): Observable<any> {
		// CAMBIAR .put POR .patch
		return this.http.patch(`${this.apiUrl}${id}/`, datos);
	}

	// 4. Eliminar terreno
	deleteTerreno(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}${id}/`);
	}
}
