import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError, delay, map } from 'rxjs';
import { Medidor } from '../models/medidor.interface';
import { SocioService } from './socio.service'; // Importamos el servicio REAL
import { Socio } from '../models/socio.interface';

@Injectable({
	providedIn: 'root',
})
export class MedidorService {
	// Usamos el SocioService real para poder listar socios en el formulario
	private socioService = inject(SocioService);

	// --- BASE DE DATOS FALSA (MOCK) ---
	private medidoresMock: Medidor[] = [
		{
			id: 101,
			socio: 1, // Asumimos que el Socio con ID 1 existe
			codigo: 'MED-001',
			esta_activo: true,
			observacion: 'Instalado en lote 5',
			tiene_medidor_fisico: true,
		},
		{
			id: 102,
			socio: 2, // Asumimos que el Socio con ID 2 existe
			codigo: 'MED-002',
			esta_activo: true,
			observacion: 'Casa principal',
			tiene_medidor_fisico: true,
		},
		{
			id: 103,
			socio: 1, // El socio 1 tiene un segundo medidor
			codigo: 'MED-003-SIN',
			esta_activo: true,
			observacion: 'Tarifa fija para la granja',
			tiene_medidor_fisico: false, // ¡Importante!
		},
	];
	// ---------------------------------

	/**
	 * Obtiene la lista de medidores (Simulado)
	 * ¡Enriquece los datos con la info del socio!
	 */
	getMedidores(): Observable<Medidor[]> {
		return this.socioService.getSocios().pipe(
			map((socios) => {
				// "Joins" los datos falsos del medidor con los datos reales del socio
				return this.medidoresMock.map((medidor) => ({
					...medidor,
					socio_data: socios.find((s) => s.id === medidor.socio),
				}));
			}),
			delay(500), // Simula tiempo de red
		);
	}

	/**
	 * Crea un nuevo medidor (Simulado)
	 */
	createMedidor(medidorData: any): Observable<Medidor> {
		const newId = Math.floor(Math.random() * 1000) + 200;
		const nuevoMedidor: Medidor = {
			id: newId,
			socio: medidorData.socio, // El formulario envía el ID del socio
			codigo: medidorData.codigo,
			esta_activo: true, // Siempre activo al crear
			observacion: medidorData.observacion,
			tiene_medidor_fisico: medidorData.tiene_medidor_fisico,
		};

		this.medidoresMock.push(nuevoMedidor);
		return of(nuevoMedidor).pipe(delay(500));
	}

	/**
	 * Actualiza un medidor (Simulado)
	 */
	updateMedidor(id: number, medidorData: any): Observable<Medidor> {
		const index = this.medidoresMock.findIndex((m) => m.id === id);
		if (index === -1) {
			return throwError(() => new Error('Medidor no encontrado en el mock'));
		}

		const medidorActualizado = {
			...this.medidoresMock[index], // Mantiene el ID
			...medidorData, // Sobrescribe con los datos del form
		};

		this.medidoresMock[index] = medidorActualizado;
		return of(medidorActualizado).pipe(delay(500));
	}

	/**
	 * Elimina (desactiva) un medidor (Simulado)
	 */
	deleteMedidor(id: number): Observable<void> {
		const index = this.medidoresMock.findIndex((m) => m.id === id);
		if (index === -1) {
			return throwError(() => new Error('Medidor no encontrado en el mock'));
		}

		// Simula el "soft delete" del backend
		this.medidoresMock[index].esta_activo = false;
		return of(void 0).pipe(delay(500));
	}

	/**
	 * (REAL) Obtiene los socios para el dropdown
	 */
	getSociosParaDropdown(): Observable<Socio[]> {
		// Llama al servicio real de Socios
		return this.socioService.getSocios();
	}
}
