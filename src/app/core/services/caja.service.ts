import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
	providedIn: 'root',
})
export class CajaService {
	constructor() {}

	// 1. Simular búsqueda de socio y sus deudas
	// 💡 El guion bajo (_) evita el error de "variable no usada"
	buscarSocioConDeudas(_termino: string) {
		// Simulamos una demora de red
		return of({
			encontrado: true,
			socio: {
				id: 1,
				nombres: 'Juan José',
				apellidos: 'Pérez García',
				cedula: '0501234567',
				barrio: 'Latacunga',
				estado: 'ACTIVO',
			},
			// Deudas pendientes (Agua + Mingas)
			deudas: [
				{
					id: 101,
					concepto: 'Consumo Agua - Nov 2025',
					monto: 3.5,
					vencimiento: '2025-12-05',
					tipo: 'AGUA',
					seleccionado: true,
				},
				{
					id: 102,
					concepto: 'Multa Minga - Limpieza Canales',
					monto: 10.0,
					vencimiento: '2025-12-15',
					tipo: 'MINGA',
					seleccionado: true,
				},
				{
					id: 103,
					concepto: 'Consumo Agua - Dic 2025',
					monto: 3.5,
					vencimiento: '2026-01-05',
					tipo: 'AGUA',
					seleccionado: true,
				},
			],
		}).pipe(delay(800));
	}

	// 2. Simular el cobro (Pago exitoso)
	procesarPago(_deudasIds: number[], _metodoPago: string) {
		// Aquí podrías hacer un console.log para ver qué llega, pero con el _ basta para que compile.
		console.log('Procesando pago:', { ids: _deudasIds, metodo: _metodoPago });
		return of({ success: true, ticket: 'TKT-2025-001' }).pipe(delay(1000));
	}

	// 3. Simular lista de transferencias por validar
	getTransferenciasPendientes() {
		return of([
			{
				id: 501,
				socio: 'Maria Lopez',
				fecha: '2025-12-18',
				monto: 3.5,
				comprobante_url: 'assets/comprobante_mock.jpg',
				banco: 'Pichincha',
			},
			{
				id: 502,
				socio: 'Carlos Vives',
				fecha: '2025-12-19',
				monto: 13.5,
				comprobante_url: 'assets/comprobante_mock.jpg',
				banco: 'Guayaquil',
			},
		]).pipe(delay(500));
	}
}
