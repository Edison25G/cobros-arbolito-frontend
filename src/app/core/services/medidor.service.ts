import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { Medidor, EstadoMedidor } from '../models/medidor.interface';

// --- DATOS FALSOS (MOCK DATA) ---
const MOCK_MEDIDORES: Medidor[] = [
	{
		id: 1,
		codigo: 'M-0001',
		marca: 'Elster',
		fechaInstalacion: new Date('2023-01-15'),
		estado: EstadoMedidor.Asignado,
		idSocioAsignado: 1,
		nombreSocioAsignado: 'Juan Pérez',
	},
	{
		id: 2,
		codigo: 'M-0002',
		marca: 'Itron',
		fechaInstalacion: new Date('2023-02-20'),
		estado: EstadoMedidor.Asignado,
		idSocioAsignado: 2,
		nombreSocioAsignado: 'Maria Gomez',
	},
	{
		id: 3,
		codigo: 'M-0003',
		marca: 'Elster',
		fechaInstalacion: null,
		estado: EstadoMedidor.EnBodega,
		idSocioAsignado: null,
		nombreSocioAsignado: null,
	},
	{
		id: 4,
		codigo: 'M-0004',
		marca: 'Badger',
		fechaInstalacion: new Date('2022-05-10'),
		estado: EstadoMedidor.Mantenimiento,
		idSocioAsignado: null,
		nombreSocioAsignado: null,
	},
	{
		id: 5,
		codigo: 'M-0005',
		marca: 'Itron',
		fechaInstalacion: new Date('2023-03-01'),
		estado: EstadoMedidor.Asignado,
		idSocioAsignado: 3,
		nombreSocioAsignado: 'Carlos Andrade',
	},
];
// --- FIN DE LOS DATOS FALSOS ---

@Injectable({
	providedIn: 'root',
})
export class MedidorService {
	constructor() {}

	/**
	 * Simula una llamada API para obtener todos los medidores.
	 * Tarda 600ms en responder.
	 */
	getMedidores(): Observable<Medidor[]> {
		console.log('MedidorService: Simulando carga de medidores...');

		return timer(600).pipe(
			map(() => {
				console.log('MedidorService: Carga simulada completa.');
				return MOCK_MEDIDORES;
			}),
		);
	}

	// (Aquí irían los métodos simulados de create, update, delete)
	getMedidorDelSocioLogueado(): Observable<Medidor | undefined> {
		console.log('MedidorService: Buscando medidor para el socio logueado (ID 2)...');
		const ID_SOCIO_LOGUEADO = 2;

		return timer(300).pipe(
			map(() => {
				// Busca en el mock el medidor asignado a ese socio
				return MOCK_MEDIDORES.find((m) => m.idSocioAsignado === ID_SOCIO_LOGUEADO);
			}),
		);
	}
}
