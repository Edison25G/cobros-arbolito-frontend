export interface Multa {
	id: number;
	socio_id: number;
	socio_nombre: string; // Nombre del deudor
	minga_titulo: string; // "Inasistencia a..." (viene de la descripción de la factura)
	fecha: string;
	monto: number;
	estado: 'PENDIENTE' | 'PAGADA' | 'ANULADA' | 'RECTIFICADA';
}

export interface ImpugnarMultaDTO {
	accion: 'ANULAR' | 'RECTIFICAR';
	motivo: string;
	nuevo_monto?: number;
}
