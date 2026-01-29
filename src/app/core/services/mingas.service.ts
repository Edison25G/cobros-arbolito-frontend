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
		return this.http.get<Minga[]>(`${this.apiUrl}/eventos/`);
	}

	getById(id: number): Observable<Minga> {
		return this.http.get<Minga>(`${this.apiUrl}/eventos/${id}/`);
	}

	create(minga: Minga): Observable<Minga> {
		return this.http.post<Minga>(`${this.apiUrl}/eventos/`, minga);
	}

	delete(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/eventos/${id}/`);
	}

	// --- ASISTENCIA ---

	// Obtener lista para tomar asistencia (Socios + Estado actual en esa minga)
	getAsistencia(mingaId: number): Observable<ItemAsistencia[]> {
		return this.http.get<ItemAsistencia[]>(`${this.apiUrl}/eventos/${mingaId}/asistencia/`);
	}

	// Guardar la lista de asistencia
	// Guardar la lista de asistencia (Enviar solo IDs de presentes)
	saveAsistencia(eventoId: number, lista: ItemAsistencia[]): Observable<any> {
		// Filtramos solo los que están presentes
		const sociosIds = lista.filter((item) => item.estado === 'Presente').map((item) => item.socio_id);
		const payload = { socios_ids: sociosIds };
		return this.http.put(`${this.apiUrl}/eventos/${eventoId}/registrar_asistencia/`, payload);
	}

	// Cerrar evento (Generar multas)
	cerrarEvento(id: number): Observable<any> {
		return this.http.post(`${this.apiUrl}/eventos/${id}/cerrar/`, {});
	}
}
