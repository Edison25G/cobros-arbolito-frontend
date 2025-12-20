import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { LecturaPendiente, GenerarEmisionDTO, GenerarFacturaDTO } from '../interfaces/factura.interface';

@Injectable({
	providedIn: 'root',
})
export class FacturacionService {
	private http = inject(HttpClient);
	private apiUrl = `${environment.apiUrl}`; // Base: http://localhost:8000/api/v1

	constructor() {}

	/**
	 * 1. Obtener lecturas que NO tienen factura aún (Pre-visualización).
	 * Endpoint sugerido: GET /api/v1/lecturas/pendientes/?mes=11&anio=2025
	 */
	getPendientes(mes: number, anio: number): Observable<LecturaPendiente[]> {
		return this.http.get<LecturaPendiente[]>(`${this.apiUrl}/lecturas/pendientes/?mes=${mes}&anio=${anio}`);
	}

	/**
	 * 2. EMISIÓN MASIVA (El botón "Generar Planilla Mensual").
	 * Esto crea las facturas en estado 🔴 PENDIENTE.
	 */
	generarEmisionMasiva(datos: GenerarEmisionDTO): Observable<any> {
		return this.http.post(`${this.apiUrl}/facturas/emision-masiva/`, datos);
	}

	/**
	 * 3. Emisión Individual (Caso de emergencia/manual).
	 */
	generarFacturaIndividual(datos: GenerarFacturaDTO): Observable<any> {
		return this.http.post(`${this.apiUrl}/facturas/`, datos);
	}
}
