import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { Factura, EstadoFactura, GenerarFacturacionPayload, FacturacionResponse } from '../models/factura.interface';

// --- DATOS FALSOS (MOCK DATA) ACTUALIZADOS ---
const MOCK_FACTURAS: Factura[] = [
	{
		id: 101,
		numeroFactura: 'F-001-000123',
		idSocio: 1, // Socio Juan Pérez
		nombreSocio: 'Juan Pérez',
		cedulaSocio: '1712345678',
		fechaEmision: new Date('2025-11-05'),
		fechaVencimiento: new Date('2025-11-20'),
		total: 25.5,
		estado: EstadoFactura.Pendiente,
	},
	{
		id: 102,
		numeroFactura: 'F-001-000122',
		idSocio: 2, // Socio Maria Gomez
		nombreSocio: 'Maria Gomez',
		cedulaSocio: '1787654321',
		fechaEmision: new Date('2025-10-05'),
		fechaVencimiento: new Date('2025-10-20'),
		total: 18.0,
		estado: EstadoFactura.Pagada,
	},
	{
		id: 103,
		numeroFactura: 'F-001-000121',
		idSocio: 4, // Socio Ana Martinez
		nombreSocio: 'Ana Martinez',
		cedulaSocio: '1799887766',
		fechaEmision: new Date('2025-09-05'),
		fechaVencimiento: new Date('2025-09-20'),
		total: 30.1,
		estado: EstadoFactura.Vencida,
	},
	// --- NUEVAS FACTURAS PARA PROBAR ---
	{
		id: 104,
		numeroFactura: 'F-001-000124',
		idSocio: 2, // Otra para Maria Gomez
		nombreSocio: 'Maria Gomez',
		cedulaSocio: '1787654321',
		fechaEmision: new Date('2025-11-05'),
		fechaVencimiento: new Date('2025-11-20'),
		total: 22.0,
		estado: EstadoFactura.Pendiente,
	},
	{
		id: 105,
		numeroFactura: 'F-001-000125',
		idSocio: 3, // Para Carlos Andrade
		nombreSocio: 'Carlos Andrade',
		cedulaSocio: '1755443322',
		fechaEmision: new Date('2025-10-10'),
		fechaVencimiento: new Date('2025-10-25'),
		total: 40.0,
		estado: EstadoFactura.Vencida,
	},
];
// --- FIN DE LOS DATOS FALSOS ---

@Injectable({
	providedIn: 'root',
})
export class FacturacionService {
	constructor() {}

	// ... (getFacturas() y generarFacturacion() se quedan igual) ...
	getFacturas(): Observable<Factura[]> {
		console.log('FacturacionService: Simulando carga de facturas...');
		return timer(700).pipe(map(() => MOCK_FACTURAS));
	}

	generarFacturacion(payload: GenerarFacturacionPayload): Observable<FacturacionResponse> {
		console.log('FacturacionService: Simulando generación de facturas...', payload);
		return timer(1500).pipe(
			map(() => ({
				success: true,
				message: 'Facturación del mes generada exitosamente',
				facturasGeneradas: 120,
			})),
		);
	}

	// --- NUEVO MÉTODO ---
	/**
	 * Simula la obtención de facturas PENDIENTES o VENCIDAS para un socio.
	 * Tarda 400ms en responder.
	 */
	getFacturasPendientesPorSocio(idSocio: number): Observable<Factura[]> {
		console.log(`FacturacionService: Buscando facturas pendientes para socio ${idSocio}`);

		return timer(400).pipe(
			map(() => {
				// Filtra la lista de facturas
				return MOCK_FACTURAS.filter(
					(factura) =>
						factura.idSocio === idSocio &&
						(factura.estado === EstadoFactura.Pendiente || factura.estado === EstadoFactura.Vencida),
				);
			}),
		);
	}

	getFacturasDelSocioLogueado(): Observable<Factura[]> {
		console.log('FacturacionService: Buscando historial de facturas para el socio logueado (ID 2)...');
		const ID_SOCIO_LOGUEADO = 2; // Simulación para Maria Gomez

		return timer(500).pipe(
			map(() => {
				// Filtra la lista de facturas
				return MOCK_FACTURAS.filter((factura) => factura.idSocio === ID_SOCIO_LOGUEADO);
			}),
		);
	}
}
