import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Minga, ItemAsistencia } from '../interfaces/minga.interface';

@Injectable({
	providedIn: 'root',
})
export class MingasService {
	private http = inject(HttpClient);
	private apiUrl = environment.apiUrl;

	// --- CRUD REAL EVENTOS ---

	getAll(): Observable<Minga[]> {
		return this.http.get<Minga[]>(`${this.apiUrl}/eventos/`);
	}

	getById(id: number): Observable<Minga> {
		return this.http.get<Minga>(`${this.apiUrl}/eventos/${id}/`);
	}

	create(minga: Minga): Observable<Minga> {
		return this.http.post<Minga>(`${this.apiUrl}/eventos/`, minga);
	}

	updateEvento(id: number, evento: any): Observable<any> {
		return this.http.put(`${this.apiUrl}/eventos/${id}/`, evento);
	}

	delete(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}/eventos/${id}/`);
	}

	// --- ASISTENCIA ---

	// 1. Obtener lista para tomar asistencia
	// CORRECCIÓN: Usamos el endpoint global de asistencias filtrando por el evento_id
	getAsistencia(mingaId: number): Observable<ItemAsistencia[]> {
		return this.http.get<any[]>(`${this.apiUrl}/asistencias/?evento=${mingaId}`).pipe(
			map((response) => {
				// Si la respuesta viene paginada (results), usamos response.results, sino response directo
				const data = Array.isArray(response) ? response : (response as any).results || [];

				return data.map((item: any) => ({
					id: item.id,
					socio_id: item.socio, // Ajuste: En tu AsistenciaInlineSerializer es 'socio', no 'socio_id'
					nombres: item.socio_nombre,
					identificacion: 'N/A', // Nota: Tu InlineSerializer actual no trae la cédula.
					estado: item.estado,
					estado_justificacion: item.estado_justificacion || 'SIN_SOLICITUD',
					observacion: item.observacion || '',
					multa_factura: item.multa_factura,
				}));
			}),
		);
	}

	// 2. Guardar asistencia masiva
	// CORRECCIÓN: Apuntamos al endpoint correcto con POST y con el formato que espera el Backend
	saveAsistencia(eventoId: number, lista: ItemAsistencia[]): Observable<any> {
		// Armamos el array de objetos {socio_id, estado} que pide el RegistroAsistenciaSerializer
		const payloadAsistencias = lista.map((item) => ({
			socio_id: item.socio_id,
			estado: this.mapFrontendToBackend(item.estado), // Traducimos 'Presente' a 'ASISTIO', etc.
		}));

		const payload = {
			asistencias: payloadAsistencias,
		};

		// El endpoint usa guion medio, no guion bajo
		return this.http.post(`${this.apiUrl}/eventos/${eventoId}/registrar-asistencia/`, payload);
	}

	// --- FUNCIONES AYUDANTES DE TRADUCCIÓN ---

	private mapFrontendToBackend(estadoFrontend: string): string {
		// Imprimimos en consola para que veas qué está traduciendo (puedes borrar el console.log después)
		console.log('Estado original del botón:', estadoFrontend);

		// AHORA SÍ: Reconoce 'PRESENTE' en mayúsculas exactamente como viene del botón
		if (estadoFrontend === 'PRESENTE' || estadoFrontend === 'Presente' || estadoFrontend === 'ASISTIO') {
			return 'ASISTIO';
		}
		if (estadoFrontend === 'FALTA' || estadoFrontend === 'Falta') {
			return 'FALTA';
		}
		if (estadoFrontend === 'JUSTIFICADO' || estadoFrontend === 'Exonerado') {
			return 'JUSTIFICADO';
		}

		return 'FALTA'; // Por defecto
	}

	// --- PROCESAR MULTAS ---

	// Cerrar evento (Generar multas)
	// CORRECCIÓN: El action en Django se llama 'procesar-multas', no 'cerrar'
	cerrarEvento(id: number): Observable<any> {
		return this.http.post(`${this.apiUrl}/eventos/${id}/procesar-multas/`, {});
	}
}
