// Define los posibles estados de un socio
export enum EstadoSocio {
	AlDia = 'Al día',
	EnMora = 'En mora',
	Inactivo = 'Inactivo',
}

// Define la estructura de un objeto Socio
export interface Socio {
	id: number;
	cedula: string;
	nombre: string;
	apellido: string;
	email: string;
	telefono: string;
	estado: EstadoSocio;
	// Puedes añadir más campos que viste en la API, como 'id_medidor', 'direccion', etc.
}
