import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { FacturaSocio, EstadoFactura } from '../interfaces/pago.interfaces';

// Nota: He quitado HttpClient, inject y environment por ahora para evitar errores de "no usado".
// Los volveremos a poner cuando conectemos el backend real.

@Injectable({
	providedIn: 'root',
})
export class PagoService {
	// --- MOCK DATA (Datos quemados para pruebas) ---
	// Quita el tipo explícito : FacturaSocio[] del principio y ponlo al final con 'as'
	private misFacturasMock = [
		{
			id: 201,
			fecha_emision: '2025-11-05',
			fecha_vencimiento: '2025-12-05',
			total: 7.5, // Coincide con la foto
			estado: EstadoFactura.Pendiente,
			detalle: {
				lectura_anterior: 230,
				lectura_actual: 251,
				consumo_total: 21,
				m3_exceso_1: 5, // 5 m3 de exceso rango 1
				m3_exceso_2: 6, // 6 m3 de exceso rango 2
				costo_base: 4.0, // Inventado base
				costo_exceso_1: 0.5,
				costo_exceso_2: 3.0,
			},
		},
		{
			id: 202,
			fecha_emision: '2025-10-05',
			fecha_vencimiento: '2025-11-05',
			total: 3.5,
			estado: EstadoFactura.EnVerificacion,
			url_comprobante: 'assets/comprobante_dummy.jpg',
			detalle: {
				lectura_anterior: 220,
				lectura_actual: 230,
				consumo_total: 10,
				costo_base: 3.5,
			},
		},
		{
			id: 203,
			fecha_emision: '2025-09-05',
			fecha_vencimiento: '2025-10-05',
			total: 3.5,
			estado: EstadoFactura.Pagada,
		},
	] as FacturaSocio[]; // <--- EL TRUCO ESTÁ AQUÍ

	constructor() {}

	getFacturasDelSocioLogueado(): Observable<FacturaSocio[]> {
		// Simulamos un delay de red de 800ms
		return of(this.misFacturasMock).pipe(delay(800));
	}

	subirComprobante(facturaId: number, archivo: File): Observable<any> {
		// 1. Aquí "usamos" la variable archivo para que TypeScript no marque error
		console.log(`Simulando subida del archivo: ${archivo.name} (Tamaño: ${archivo.size})`);

		console.log(`Actualizando estado de la factura ${facturaId}...`);

		// Actualizamos el mock localmente para ver el cambio en pantalla
		const index = this.misFacturasMock.findIndex((f) => f.id === facturaId);
		if (index !== -1) {
			this.misFacturasMock[index].estado = EstadoFactura.EnVerificacion;
		}

		return of({ success: true, message: 'Comprobante subido correctamente' }).pipe(delay(1500));
	}
}
