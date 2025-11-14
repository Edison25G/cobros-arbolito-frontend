// Define los posibles estados de una factura
export enum EstadoFactura {
	Pendiente = 'Pendiente',
	Pagada = 'Pagada',
	Vencida = 'Vencida',
	Anulada = 'Anulada',
}

// Define la estructura de un objeto Factura
export interface Factura {
	id: number;
	numeroFactura: string; // Ej. "F-001-000123"
	idSocio: number;
	nombreSocio: string; // Denormalizado para la tabla
	cedulaSocio: string; // Denormalizado para la tabla
	fechaEmision: Date;
	fechaVencimiento: Date;
	total: number;
	estado: EstadoFactura;
}

// Lo que enviamos al generar facturas
export interface GenerarFacturacionPayload {
	mes: number; // 1-12
	anio: number;
}

// La respuesta del servicio de facturación
export interface FacturacionResponse {
	success: boolean;
	message: string;
	facturasGeneradas: number;
}
