export enum EstadoFinanciero {
	PENDIENTE = 'PENDIENTE',
	PAGADA = 'PAGADA',
	ANULADA = 'ANULADA',
}

export enum EstadoSRI {
	NO_ENVIADA = 'NO_ENVIADA',
	PENDIENTE_FIRMA = 'PENDIENTE_FIRMA',
	PENDIENTE_SRI = 'PENDIENTE_SRI',
	AUTORIZADA = 'AUTORIZADA',
	DEVUELTA = 'DEVUELTA',
	RECHAZADA = 'RECHAZADA',
	ERROR = 'ERROR',
}

export interface FacturaSocio {
	id: number;
	fecha_emision: string;
	fecha_vencimiento: string;
	total: number;
	estado: string; // (Legacy)
	estado_financiero?: EstadoFinanciero;
	estado_sri: EstadoSRI | string | null;
	sri_mensaje_error?: string | null;
	clave_acceso_sri?: string | null;
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
