import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { PagoPayload, PagoResponse } from '../models/pago.interface';

@Injectable({
	providedIn: 'root',
})
export class PagoService {
	constructor() {}

	/**
	 * Simula el guardado de un pago y la actualización del estado de la factura.
	 * Tarda 1 segundo en responder.
	 */
	registrarPago(payload: PagoPayload): Observable<PagoResponse> {
		console.log('PagoService: Simulando registro de pago...', payload);

		// Simulamos una espera de 1 segundo
		return timer(1000).pipe(
			map(() => {
				console.log('PagoService: Pago registrado (simulado).');
				// (En la vida real, la API marcaría la factura como 'Pagada')
				return {
					success: true,
					message: 'Pago registrado exitosamente',
					idPago: Math.floor(Math.random() * 1000),
				};
			}),
		);
	}
}
