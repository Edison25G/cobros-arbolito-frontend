// Define los posibles estados de un medidor
export enum EstadoMedidor {
	Asignado = 'Asignado',
	EnBodega = 'En Bodega', // (En stock)
	Mantenimiento = 'Mantenimiento',
}

// Define la estructura de un objeto Medidor
export interface Medidor {
	id: number;
	codigo: string; // Ej. "M-00123"
	marca: string;
	fechaInstalacion: Date | null;
	estado: EstadoMedidor;

	// Datos del socio al que está asignado (pueden ser nulos)
	idSocioAsignado: number | null;
	nombreSocioAsignado: string | null; // Denormalizado para la tabla
}
