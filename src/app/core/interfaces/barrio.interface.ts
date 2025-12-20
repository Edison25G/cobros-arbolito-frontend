export interface Barrio {
	id: number;
	nombre: string;
	descripcion?: string; // El serializer dice que puede ser null/blank
	activo: boolean;
}

// Opcional: Si vas a crear formularios de barrio en el futuro
export interface CrearBarrioDTO {
	nombre: string;
	descripcion?: string;
	activo?: boolean;
}
