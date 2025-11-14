import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { LecturaPayload, LecturaResponse } from '../models/lectura.interface';

// --- NUEVA INTERFAZ Y DATOS FALSOS ---
export interface HistorialLectura {
	id: number;
	idMedidor: number;
	fechaLectura: Date;
	valorLectura: number;
	consumoMes: number; // Consumo en m³
}

const MOCK_HISTORIAL: HistorialLectura[] = [
	// Historial para Medidor ID 2 (Maria Gomez)
	{ id: 1, idMedidor: 2, fechaLectura: new Date('2025-08-05'), valorLectura: 1150, consumoMes: 0 },
	{ id: 2, idMedidor: 2, fechaLectura: new Date('2025-09-05'), valorLectura: 1175, consumoMes: 25 },
	{ id: 3, idMedidor: 2, fechaLectura: new Date('2025-10-05'), valorLectura: 1200, consumoMes: 25 },
	{ id: 4, idMedidor: 2, fechaLectura: new Date('2025-11-05'), valorLectura: 1222, consumoMes: 22 },
	// Historial para Medidor ID 1 (Juan Perez)
	{ id: 5, idMedidor: 1, fechaLectura: new Date('2025-10-05'), valorLectura: 980, consumoMes: 0 },
	{ id: 6, idMedidor: 1, fechaLectura: new Date('2025-11-05'), valorLectura: 1005, consumoMes: 25 },
];
// --- FIN DE DATOS FALSOS ---

@Injectable({
	providedIn: 'root',
})
export class LecturaService {
	constructor() {}

	// ... (registrarLectura() se queda igual) ...
	registrarLectura(_payload: LecturaPayload): Observable<LecturaResponse> {
		// ...
		return timer(700).pipe(
			map(() => ({
				success: true,
				message: 'Lectura registrada exitosamente',
				idLectura: Math.floor(Math.random() * 1000),
			})),
		);
	}

	// --- AÑADIR ESTE NUEVO MÉTODO ---
	/**
	 * Simula la obtención del historial de lecturas para el socio logueado.
	 * * (SIMULACIÓN: Pretendemos que el socio logueado es el ID 2)
	 */
	getHistorialLecturasSocioLogueado(): Observable<HistorialLectura[]> {
		console.log('LecturaService: Buscando historial de lecturas para el socio logueado (ID 2)...');
		const ID_MEDIDOR_SOCIO = 2; // El medidor de Maria Gomez

		return timer(600).pipe(
			map(() => {
				// Filtra el historial por el ID del medidor
				return MOCK_HISTORIAL.filter((l) => l.idMedidor === ID_MEDIDOR_SOCIO).sort(
					(a, b) => b.fechaLectura.getTime() - a.fechaLectura.getTime(),
				); // Más recientes primero
			}),
		);
	}
}
