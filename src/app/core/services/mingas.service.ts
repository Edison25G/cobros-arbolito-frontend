import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment.development';
// Importamos las interfaces actualizadas
import { Minga, ItemAsistencia } from '../interfaces/minga.interface';
// Importamos el modelo de Socio para leer la respuesta del backend
//import { Socio } from '../models/socio.interface';

@Injectable({
	providedIn: 'root',
})
export class MingasService {
	private http = inject(HttpClient);
	private apiUrl = environment.apiUrl;

	// --- CRUD REAL (CONECTADO AL BACKEND) ---

	getAll(): Observable<Minga[]> {
		// Busca las mingas en el backend
		return this.http.get<Minga[]>(`${this.apiUrl}/mingas/`);
	}

	getById(id: number): Observable<Minga> {
		return this.http.get<Minga>(`${this.apiUrl}/mingas/${id}/`);
	}

	create(minga: Minga): Observable<Minga> {
		return this.http.post<Minga>(`${this.apiUrl}/mingas/`, minga);
	}

	delete(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/mingas/${id}/`);
	}

	// --- ASISTENCIA ---

	// Obtener lista para tomar asistencia (Socios + Estado actual en esa minga)
	getAsistencia(mingaId: number): Observable<ItemAsistencia[]> {
		return this.http.get<ItemAsistencia[]>(`${this.apiUrl}/mingas/${mingaId}/asistencia/`);
	}

	// Guardar la lista de asistencia
	saveAsistencia(mingaId: number, lista: ItemAsistencia[]): Observable<any> {
		const payload = { asistencias: lista };
		return this.http.post(`${this.apiUrl}/mingas/${mingaId}/registrar-asistencia/`, payload);
	}
}
