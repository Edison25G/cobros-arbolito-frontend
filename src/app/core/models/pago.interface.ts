// Define los métodos de pago
export enum MetodoPago {
	Efectivo = 'Efectivo',
	Transferencia = 'Transferencia',
	Otro = 'Otro',
}

// Lo que enviamos al registrar un pago
export interface PagoPayload {
	idFactura: number;
	montoPagado: number;
	metodoPago: MetodoPago;
	fechaPago: Date;
}

// La respuesta del servicio
export interface PagoResponse {
	success: boolean;
	message: string;
	idPago?: number;
}
