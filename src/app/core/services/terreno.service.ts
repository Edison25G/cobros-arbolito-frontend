import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class TerrenoService {
	private http = inject(HttpClient);
	// Asegúrate de que tu compañero cree este endpoint en Django
	private apiUrl = `${environment.apiUrl}/terrenos/`;

	constructor() {}

	// 1. Obtener terrenos de un socio específico
	getTerrenosPorSocio(socioId: number): Observable<any[]> {
		return this.http.get<any[]>(`${this.apiUrl}?socio_id=${socioId}`);
	}

	// 2. Crear un nuevo terreno
	createTerreno(datos: any): Observable<any> {
		return this.http.post<any>(this.apiUrl, datos);
	}

	// 3. Editar terreno (Para el futuro)
	updateTerreno(id: number, datos: any): Observable<any> {
		return this.http.put<any>(`${this.apiUrl}${id}/`, datos);
	}

	// 4. Eliminar terreno
	deleteTerreno(id: number): Observable<any> {
		return this.http.delete<any>(`${this.apiUrl}${id}/`);
	}
}
