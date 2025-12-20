import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { Configuracion } from '../models/configuracion.interface';

// --- DATOS FALSOS (MOCK DATA) ---
// Simula los datos guardados en la base de datos
let MOCK_CONFIG: Configuracion = {
	id: 1,
	nombreJunta: 'Junta de Riego "El Arbolito"',
	ruc: '1791234567001',
	direccion: 'Av. Siempre Viva 123, Pujilí',
	telefono: '032123456',
	email: 'contacto@el-arbolito.com',
	tarifaAguaMetroCubico: 0.75, // $0.75 por m³
	tarifaMoraMensual: 1.5, // $1.50 de multa
	valorIVA: 0.15, // 15%
};
// --- FIN DE LOS DATOS FALSOS ---

@Injectable({
	providedIn: 'root',
})
export class ConfiguracionService {
	constructor() {}

	/**
	 * Simula la carga de la configuración actual.
	 * Tarda 400ms.
	 */
	getConfiguracion(): Observable<Configuracion> {
		console.log('ConfiguracionService: Simulando carga de configuración...');
		return timer(400).pipe(map(() => MOCK_CONFIG));
	}

	/**
	 * Simula el guardado de la nueva configuración.
	 * Tarda 1 segundo.
	 */
	updateConfiguracion(config: Configuracion): Observable<{ success: boolean; data: Configuracion }> {
		console.log('ConfiguracionService: Simulando guardado de configuración...', config);

		return timer(1000).pipe(
			map(() => {
				// Actualiza nuestra variable falsa
				MOCK_CONFIG = { ...config };
				console.log('ConfiguracionService: Configuración guardada.');
				return { success: true, data: MOCK_CONFIG };
			}),
		);
	}
}
