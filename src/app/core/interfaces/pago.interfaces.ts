/**
 * Los estados de factura que tu compañero debe añadir al backend.
 */
export enum EstadoFactura {
	Pendiente = 'Pendiente',
	Pagada = 'Pagada',
	Anulada = 'Anulada',
	EnVerificacion = 'En Verificación', // <-- ¡EL NUEVO ESTADO!
}

/**
 * La estructura de la factura que el Socio verá en su tabla.
 * (La creamos aquí para no mezclarla con las de 'factura.service.ts')
 */
export interface FacturaSocio {
	id: number;
	fecha_emision: string; // "YYYY-MM-DD"
	fecha_vencimiento: string; // "YYYY-MM-DD"
	total: number;
	estado: EstadoFactura;
	// (Añadiremos más campos si la API real los devuelve)
}
