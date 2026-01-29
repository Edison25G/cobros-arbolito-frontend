export interface Evento {
	id: number;
	titulo: string;
	descripcion?: string;
	fecha: string; // YYYY-MM-DD
	lugar: string;
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
	estado: 'Presente' | 'Falta' | 'Exonerado';
	observacion?: string;
}

export interface ItemAsistencia {
	socio_id: number;
	nombres: string; // Para mostrar "Juan Pérez"
	cedula: string; // Para verificar identidad
	estado: 'Presente' | 'Falta' | 'Exonerado';
	observacion?: string;
}
