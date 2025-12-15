import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// Importamos la interfaz desde el archivo que acabamos de crear
import { Barrio } from '../interfaces/barrio.interface';

@Injectable({
	providedIn: 'root',
})
export class BarriosService {
	// MOCK: Los mismos barrios que se ven en tu pantalla de "Barrios/Zonas"
	private barriosMock: Barrio[] = [
		{ id: 1, nombre: 'Alpamalag' },
		{ id: 2, nombre: 'Latacunga' },
		{ id: 3, nombre: 'Pujili' },
		{ id: 4, nombre: 'San Sebastián' },
		{ id: 5, nombre: 'El Centro' },
	];

	constructor() {}

	getBarrios(): Observable<Barrio[]> {
		return of(this.barriosMock).pipe(delay(300)); // Simulamos carga
	}
}
