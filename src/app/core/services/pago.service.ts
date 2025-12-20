import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { FacturaSocio, EstadoFactura } from '../interfaces/pago.interfaces';

@Injectable({
	providedIn: 'root',
})
export class PagoService {
	// --- BASE DE DATOS FALSA (MOCK) ---
	private misFacturasMock: FacturaSocio[] = [
		{
			id: 201,
			fecha_emision: '2025-11-05',
			fecha_vencimiento: '2025-12-05',
			total: 5.5,
			estado: EstadoFactura.Pendiente,
		},
		{
			id: 202,
			fecha_emision: '2025-10-05',
			fecha_vencimiento: '2025-11-05',
			total: 3.5,
			estado: EstadoFactura.EnVerificacion, // Esta ya fue "enviada"
		},
		{
			id: 203,
			fecha_emision: '2025-09-05',
			fecha_vencimiento: '2025-10-05',
			total: 3.5,
			estado: EstadoFactura.Pagada,
		},
	];
	// ---------------------------------

	constructor() {}

	/**
	 * [SIMULADO] Obtiene la lista de facturas del socio logueado.
	 * (En el futuro, esto llamará a GET /api/v1/facturas/?socio_id=...)
	 */
	getFacturasDelSocioLogueado(): Observable<FacturaSocio[]> {
		console.log('PagoService (Simulado): Obteniendo facturas...');
		return of(this.misFacturasMock).pipe(delay(1000));
	}

	/**
	 * [SIMULADO] Sube el comprobante y cambia el estado a "En Verificación".
	 * (En el futuro, esto llamará a POST /api/v1/facturas/<id>/subir-comprobante/)
	 */
	subirComprobante(facturaId: number, archivo: File): Observable<{ success: boolean; message: string }> {
		console.log(`PagoService (Simulado): Subiendo ${archivo.name} para factura ${facturaId}...`);

		// Simula el cambio en la base de datos falsa
		const index = this.misFacturasMock.findIndex((f) => f.id === facturaId);
		if (index !== -1) {
			this.misFacturasMock[index].estado = EstadoFactura.EnVerificacion;
		}

		return of({ success: true, message: 'Comprobante subido, pendiente de verificación.' }).pipe(delay(1500));
	}
}
