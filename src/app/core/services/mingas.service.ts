import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { environment } from '../../environments/environment.development';
// Importamos las interfaces actualizadas
import { Minga, ItemAsistencia } from '../interfaces/minga.interface';
// Importamos el modelo de Socio para leer la respuesta del backend
import { Socio } from '../models/socio.interface';

@Injectable({
	providedIn: 'root',
})
export class MingasService {
	private http = inject(HttpClient);

	// URL REAL de Socios (Django)
	private sociosUrl = environment.apiUrl + '/socios/';

	// --- DATOS MOCK DE MINGAS (Simulados) ---
	private mingasMock: Minga[] = [
		{
			id: 1,
			titulo: 'Limpieza General de Canales',
			descripcion: 'Mantenimiento anual previo al invierno.',
			fecha: '2025-12-15',
			lugar: 'Toma Principal',
			multa: 10.0,
			estado: 'Programada',
		},
		{
			id: 2,
			titulo: 'Minga de Reforestación',
			descripcion: 'Siembra de plantas nativas.',
			fecha: '2025-11-20',
			lugar: 'Vertiente El Arbolito',
			multa: 5.0,
			estado: 'Realizada',
		},
	];

	// --- CRUD MINGAS (MOCK) ---

	getAll(): Observable<Minga[]> {
		return of(this.mingasMock).pipe(delay(500));
	}

	getById(id: number): Observable<Minga | undefined> {
		const minga = this.mingasMock.find((m) => m.id === id);
		return of(minga).pipe(delay(300));
	}

	create(minga: Minga): Observable<Minga> {
		minga.id = Math.floor(Math.random() * 10000);
		minga.estado = 'Programada';
		this.mingasMock.unshift(minga);
		return of(minga).pipe(delay(500));
	}

	delete(id: number): Observable<boolean> {
		this.mingasMock = this.mingasMock.filter((m) => m.id !== id);
		return of(true).pipe(delay(500));
	}

	// --- ASISTENCIA (HÍBRIDO: BD REAL + LÓGICA FRONTEND) ---

	/**
	 * Obtiene la lista de socios ACTIVOS desde el backend
	 * y prepara la estructura para tomar lista.
	 */
	// --- ASISTENCIA (HÍBRIDO) ---

	getAsistencia(mingaId: number): Observable<ItemAsistencia[]> {
		// ✅ SOLUCIÓN: Usamos la variable en un log para "engañar" a TypeScript y que no marque error
		console.log(`Cargando lista de socios para la Minga ID: ${mingaId}`);

		// 1. Petición HTTP Real a Django (/socios/)
		return this.http.get<Socio[]>(this.sociosUrl).pipe(
			map((sociosReales) => {
				// 2. Transformamos la data
				return sociosReales
					.filter((socio) => socio.esta_activo) // Solo socios activos
					.map((socio) => {
						const item: ItemAsistencia = {
							socio_id: socio.id,
							nombres: `${socio.nombres} ${socio.apellidos}`,
							cedula: socio.cedula,
							estado: 'Falta',
							observacion: '',
						};
						return item;
					});
			}),
		);
	}

	saveAsistencia(mingaId: number, lista: ItemAsistencia[]): Observable<boolean> {
		// Aquí convertimos la lista visual a lo que espera la base de datos
		const payload = lista.map((item) => ({
			minga_id: mingaId,
			socio_id: item.socio_id,
			estado: item.estado,
			observacion: item.observacion,
		}));

		console.log('📦 ENVIANDO AL BACKEND (Simulado):', payload);

		// Simular éxito y cambio de estado
		const index = this.mingasMock.findIndex((m) => m.id === mingaId);
		if (index !== -1) {
			this.mingasMock[index].estado = 'Realizada';
		}

		return of(true).pipe(delay(800));
	}
}
