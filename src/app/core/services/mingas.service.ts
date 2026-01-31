import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
	// Obtener lista para tomar asistencia (Socios + Estado actual en esa minga)
	getAsistencia(mingaId: number): Observable<ItemAsistencia[]> {
		return this.http.get<any[]>(`${this.apiUrl}/eventos/${mingaId}/asistencia/`).pipe(
			map((response) => {
				return response.map((item) => ({
					id: item.id,
					socio_id: item.socio_id,
					nombres: item.socio_nombre,
					identificacion: item.socio_cedula,
					estado: item.estado, // Ya viene como 'PENDIENTE' | 'PRESENTE' etc.
					estado_justificacion: item.estado_justificacion || 'SIN_SOLICITUD',
					observacion: item.observacion || '',
					multa_factura: item.multa_factura,
				}));
			}),
		);
	}

	// 2. Guardar asistencia (Solo enviar IDs de los presentes - Lógica Positiva)
	saveAsistencia(eventoId: number, lista: ItemAsistencia[]): Observable<any> {
		// Filtramos solo los que están en estado 'PRESENTE'
		// Nota: El backend se encarga de poner FALTA a los demás.
		const sociosIds = lista.filter((item) => item.estado === 'PRESENTE').map((item) => item.socio_id);

		const payload = {
			socios_ids: sociosIds,
		};

		return this.http.put(`${this.apiUrl}/eventos/${eventoId}/registrar_asistencia/`, payload);
	}

	// --- FUNCIONES AYUDANTES DE TRADUCCIÓN ---

	private mapBackendToFrontend(estadoBackend: string): 'Presente' | 'Falta' | 'Exonerado' | 'Pendiente' {
		if (estadoBackend === 'ASISTIO') return 'Presente';
		if (estadoBackend === 'FALTA') return 'Falta';
		if (estadoBackend === 'JUSTIFICADO') return 'Exonerado';
		return 'Falta'; // Por defecto (si es PENDIENTE lo mostramos como Falta visualmente o Pendiente)
	}

	private mapFrontendToBackend(estadoFrontend: string): string {
		if (estadoFrontend === 'Presente') return 'ASISTIO';
		if (estadoFrontend === 'Falta') return 'FALTA';
		if (estadoFrontend === 'Exonerado') return 'JUSTIFICADO';
		return 'PENDIENTE';
	}

	// Cerrar evento (Generar multas)
	cerrarEvento(id: number): Observable<any> {
		return this.http.post(`${this.apiUrl}/eventos/${id}/cerrar/`, {});
	}

	// En minga.service.ts

	updateEvento(id: number, evento: any): Observable<any> {
		return this.http.put(`${this.apiUrl}/eventos/${id}/`, evento);
	}
}
