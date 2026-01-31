export enum EstadoFactura {
	Pendiente = 'PENDIENTE',
	EnVerificacion = 'POR_VALIDAR',
	Pagada = 'PAGADA',
	Anulada = 'ANULADA',
}

export interface FacturaSocio {
	id: number;
	fecha_emision: string;
	fecha_vencimiento: string;
	total: number;
	estado: EstadoFactura;
	clave_acceso_sri?: string; // Necesario para el código de barras
	socio?: {
		nombres: string;
		apellidos: string;
		identificacion: string;
		direccion: string;
	};
	detalle?: {
		lectura_anterior: number;
		lectura_actual: number;
		consumo_total: number;
		costo_base: number;
	};
}
