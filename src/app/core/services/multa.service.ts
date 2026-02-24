import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Multa, ImpugnarMultaDTO } from '../interfaces/multa.interface';

@Injectable({
	providedIn: 'root',
})
export class MultaService {
	private http = inject(HttpClient);
	private apiUrl = environment.apiUrl;

	// 1. Obtener todas las Multas (AHORA SÍ LLAMA AL ENDPOINT CORRECTO)
	getAll(): Observable<Multa[]> {
		// Hacemos un GET al endpoint de multas puro
		return this.http.get<any[]>(`${this.apiUrl}/multas/`).pipe(
			map((response) => {
				// Si tu backend devuelve un arreglo vacío [], no pasa nada.
				if (!response || !Array.isArray(response)) return [];

				// Mapeamos lo que manda el backend a la interfaz que espera la tabla
				return response.map((item) => ({
					id: item.id,
					socio_id: item.socio_id || 0,
					// Si tu API no manda el nombre, usamos un genérico o el ID por ahora
					socio_nombre: item.socio_nombre || `Socio #${item.socio_id || 'N/A'}`,
					minga_titulo: item.motivo || 'Multa (Falta / Atraso)', // El backend usa 'motivo'
					fecha: item.fecha_emision || item.fecha_creacion || new Date().toISOString(),
					monto: parseFloat(item.valor) || parseFloat(item.monto) || 0.0,
					estado: item.estado || 'PENDIENTE',
				}));
			}),
		);
	}

	// 2. Impugnar (ESTE ESTÁ PERFECTO)
	impugnar(id: number, datos: ImpugnarMultaDTO): Observable<any> {
		return this.http.patch(`${this.apiUrl}/multas/${id}/impugnar/`, datos);
	}
}
