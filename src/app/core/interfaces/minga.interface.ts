export interface Evento {
	id: number;
	titulo: string;
	descripcion?: string;
	fecha: string; // YYYY-MM-DD
	multa: number;
	estado: 'Programada' | 'Realizada' | 'Cancelada';

	// Nuevos campos para Gobernanza
	tipo: 'MINGA' | 'SESION' | 'APORTE';
	seleccion_socios: 'TODOS' | 'BARRIO' | 'MANUAL';
	barrio_id?: number; // Solo si seleccion_socios === 'BARRIO'
}

// Alias para compatibilidad temporal si es necesario, o refactorizar todo a Evento
export type Minga = Evento;

export interface AsistenciaMinga {
	id: number;
	minga_id: number;
	socio_id: number;
	// Estados posibles de la asistencia
	estado: 'Presente' | 'Falta' | 'Exonerado' | 'Pendiente';
	observacion?: string;
}

// Nuevos tipos para integración
export type EstadoAsistencia = 'PENDIENTE' | 'PRESENTE' | 'FALTA' | 'JUSTIFICADO';
export type EstadoJustificacion = 'SIN_SOLICITUD' | 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

export interface ItemAsistencia {
	id: number;
	socio_id: number;
	nombres: string;
	identificacion: string;
	estado: EstadoAsistencia;
	estado_justificacion: EstadoJustificacion;
	observacion: string;
	multa_factura: number | null;
}
