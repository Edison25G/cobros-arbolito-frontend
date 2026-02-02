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

	// 1. Obtener todas las Multas (Usando la ruta de gestión de facturas que sí funciona)
	getAll(): Observable<Multa[]> {
		return this.http.get<any[]>(`${this.apiUrl}/facturas-gestion/pendientes/?ver_historial=true`).pipe(
			map((response) => {
				return response.map((item) => ({
					id: item.factura_id,
					socio_id: 0,
					socio_nombre: item.socio,
					minga_titulo: item.medidor === 'SIN MEDIDOR' ? 'Multa / Aporte' : 'Consumo Agua',
					fecha: item.fecha_emision,
					monto: parseFloat(item.total),
					estado: item.estado_pago,
				}));
			}),
		);
	}

	// 2. Impugnar (CORREGIDO)
	impugnar(id: number, datos: ImpugnarMultaDTO): Observable<any> {
		// ⚠️ CAMBIO IMPORTANTE:
		// Tu backend multa_views.py usa methods=['patch'], así que aquí usamos .patch
		return this.http.patch(`${this.apiUrl}/multas/${id}/impugnar/`, datos);
	}
}
