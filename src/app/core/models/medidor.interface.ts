// // Define los posibles estados de un medidor
// export enum EstadoMedidor {
// 	Asignado = 'Asignado',
// 	EnBodega = 'En Bodega', // (En stock)
// 	Mantenimiento = 'Mantenimiento',
// }

// // Define la estructura de un objeto Medidor
// export interface Medidor {
// 	id: number;
// 	codigo: string; // Ej. "M-00123"
// 	marca: string;
// 	fechaInstalacion: Date | null;
// 	estado: EstadoMedidor;

// 	// Datos del socio al que está asignado (pueden ser nulos)
// 	idSocioAsignado: number | null;
// 	nombreSocioAsignado: string | null; // Denormalizado para la tabla
// }

import { Socio } from './socio.interface';

/**
 * Define la estructura de datos de un Medidor en el frontend.
 * Basado en MedidorModel de Django.
 */
export interface Medidor {
	id: number;
	socio: number; // Guardamos el ID del socio
	codigo: string;
	esta_activo: boolean;
	observacion: string | null;
	tiene_medidor_fisico: boolean;

	// Campos adicionales (opcionales) para mostrar en la tabla
	// (El servicio los "rellenará" al listar)
	socio_data?: Socio;
}
