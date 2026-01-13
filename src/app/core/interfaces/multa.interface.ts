// core/interfaces/multa.interface.ts

/**
 * Representa una multa de minga
 */
export interface Multa {
	id: number;
	socio_id: number;
	socio_nombre?: string;
	minga_id: number;
	minga_titulo?: string;
	monto: number;
	fecha: string;
	estado: 'PENDIENTE' | 'PAGADA' | 'ANULADA' | 'RECTIFICADA';
	motivo_impugnacion?: string;
}

/**
 * DTO para impugnar/anular una multa
 */
export interface ImpugnarMultaDTO {
	accion: 'ANULAR' | 'RECTIFICAR';
	motivo: string;
	nuevo_monto?: number; // Solo requerido si accion = 'RECTIFICAR'
}

/**
 * Respuesta del backend al impugnar
 */
export interface ImpugnarMultaResponse {
	success: boolean;
	mensaje: string;
	multa?: Multa;
}
