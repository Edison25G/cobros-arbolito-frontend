import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';

import { environment } from '../../environments/environment.development';
import { MedidorBackend, HistorialConsumo } from '../..//core/interfaces/mi-medidor'; // Ajusta la ruta si es necesario

// 1. IMPORTAMOS AUTH SERVICE (Es vital para saber quién está logueado)
import { AuthService } from '../../core/services/auth.service';

@Injectable({
	providedIn: 'root',
})
export class MedidorService {
	private http = inject(HttpClient);

	// 2. INYECTAMOS EL SERVICIO DE AUTENTICACIÓN
	private authService = inject(AuthService);

	private apiUrl = `${environment.apiUrl}/medidores/`;

	// Mock para el gráfico (Esto está bien así)
	private mockHistorial: HistorialConsumo[] = [
		{ mes: 'Julio', anio: 2025, consumo: 12 },
		{ mes: 'Agosto', anio: 2025, consumo: 19 },
		{ mes: 'Septiembre', anio: 2025, consumo: 15 },
		{ mes: 'Octubre', anio: 2025, consumo: 10 },
		{ mes: 'Noviembre', anio: 2025, consumo: 21 },
		{ mes: 'Diciembre', anio: 2025, consumo: 25 },
	];

	constructor() {}

	getMedidorDelSocioLogueado(): Observable<MedidorBackend | undefined> {
		const token = localStorage.getItem('token');
		const headers = token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : undefined;

		return this.http.get<MedidorBackend[]>(this.apiUrl, { headers }).pipe(
			map((listaMedidores) => {
				// 3. OBTENEMOS EL NOMBRE REAL (Edison Unaucho)
				// Gracias al cambio que hicimos en auth.service.ts, esto ya devuelve "Edison Unaucho"
				const nombreLogueado = this.authService.getNombreCompleto();

				console.log(' Usuario Logueado:', nombreLogueado); // Debería salir "Edison Unaucho" en consola

				// 4. ELIMINAMOS "Juan Pérez" Y PONEMOS LA VARIABLE DINÁMICA
				// Buscamos en la lista el medidor cuyo dueño se llame igual al usuario logueado
				const medidorEncontrado = listaMedidores.find(
					(m) => m.nombre_socio.trim().toLowerCase() === nombreLogueado.trim().toLowerCase(),
				);

				console.log(' Medidor Encontrado:', medidorEncontrado); // Debería salir el objeto MED-2025-001
				return medidorEncontrado;
			}),
		);
	}

	getHistorialConsumo(): Observable<HistorialConsumo[]> {
		return of(this.mockHistorial);
	}
}
