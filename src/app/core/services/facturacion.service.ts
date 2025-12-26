import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
// Borramos GenerarFacturaDTO de aquí también
import { LecturaPendiente, GenerarEmisionDTO } from '../interfaces/factura.interface';

@Injectable({
	providedIn: 'root',
})
export class FacturacionService {
	private http = inject(HttpClient);
	private apiUrl = environment.apiUrl;

	// 1. GET: Obtener lecturas pendientes
	getPendientes(mes: number, anio: number): Observable<LecturaPendiente[]> {
		const url = `${this.apiUrl}/facturas/pendientes/?mes=${mes}&anio=${anio}`;
		return this.http.get<LecturaPendiente[]>(url).pipe(catchError(this.handleError));
	}

	// 2. POST: Generar Emisión Masiva
	generarEmisionMasiva(datos: GenerarEmisionDTO): Observable<any> {
		return this.http.post(`${this.apiUrl}/facturas/emision-masiva/`, datos).pipe(catchError(this.handleError));
	}

	private handleError(error: HttpErrorResponse) {
		console.error('Error en Facturación:', error);
		let msg = 'Error desconocido en el servidor';
		if (error.error && error.error.error) msg = error.error.error;
		return throwError(() => new Error(msg));
	}
}
