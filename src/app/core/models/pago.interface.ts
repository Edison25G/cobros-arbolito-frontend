export enum EstadoFactura {
	Pendiente = 'PENDIENTE',
	EnVerificacion = 'EN_VERIFICACION',
	Pagada = 'PAGADA',
	Anulada = 'ANULADA',
}

// 1. Interface del detalle
export interface DetalleConsumo {
	lectura_anterior: number;
	lectura_actual: number;
	consumo_total: number;
	costo_base: number;
	costo_exceso_1?: number;
	costo_exceso_2?: number;
	m3_exceso_1?: number;
	m3_exceso_2?: number;
}

// 2. Interface de la Factura (CON el detalle)
export interface FacturaSocio {
	id: number;
	fecha_emision: string;
	fecha_vencimiento: string;
	total: number;
	estado: EstadoFactura;
	url_comprobante?: string;
	lectura_id?: number;

	// ¡Aquí está la clave!
	detalle?: DetalleConsumo;
}
