import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { Socio, EstadoSocio } from '../models/socio.interface';

// --- NUESTROS DATOS FALSOS (MOCK DATA) ---
// Esta es nuestra "base de datos" simulada
const MOCK_SOCIOS: Socio[] = [
	{
		id: 1,
		cedula: '1712345678',
		nombre: 'Juan',
		apellido: 'Pérez',
		email: 'juan.perez@email.com',
		telefono: '0991234567',
		estado: EstadoSocio.AlDia,
	},
	{
		id: 2,
		cedula: '1787654321',
		nombre: 'Maria',
		apellido: 'Gomez',
		email: 'maria.gomez@email.com',
		telefono: '0987654321',
		estado: EstadoSocio.EnMora,
	},
	{
		id: 3,
		cedula: '1755443322',
		nombre: 'Carlos',
		apellido: 'Andrade',
		email: 'carlos.andrade@email.com',
		telefono: '0976543210',
		estado: EstadoSocio.AlDia,
	},
	{
		id: 4,
		cedula: '1799887766',
		nombre: 'Ana',
		apellido: 'Martinez',
		email: 'ana.martinez@email.com',
		telefono: '0965432109',
		estado: EstadoSocio.Inactivo,
	},
];
// --- FIN DE LOS DATOS FALSOS ---

@Injectable({
	providedIn: 'root',
})
export class SocioService {
	constructor() {}

	/**
	 * Simula una llamada API para obtener todos los socios.
	 * Tarda 500ms en responder.
	 */
	getSocios(): Observable<Socio[]> {
		console.log('SocioService: Simulando carga de socios...');

		// Usamos timer() para simular una espera de 500ms (medio segundo)
		return timer(500).pipe(
			map(() => {
				console.log('SocioService: Carga simulada completa.');
				return MOCK_SOCIOS; // Devuelve nuestra lista de datos falsos
			}),
		);
	}

	// (En el futuro, aquí crearías métodos como:)
	// getSocioById(id: number): Observable<Socio> { ... }
	// createSocio(socio: Socio): Observable<Socio> { ... }
	// updateSocio(id: number, socio: Socio): Observable<Socio> { ... }
}
