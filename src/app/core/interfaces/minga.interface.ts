export interface Minga {
	id: number;
	titulo: string; // Ej: "Limpieza de Acequia Alta"
	descripcion?: string; // Ej: "Traer pala y machete"
	fecha: string; // YYYY-MM-DD
	lugar: string; // Ej: "Sector La Loma"
	multa: number; // Valor en $ (Ej: 5.00)
	estado: 'Programada' | 'Realizada' | 'Cancelada';
}

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
