import { Terreno } from '../interfaces/terreno.interface';
import { Socio } from './socio.interface';

export interface Medidor {
	id?: number;
	codigo: string;
	estado: string; // 'ACTIVO' | 'INACTIVO' | 'DANADO'
	lectura_inicial: number;
	marca?: string;
	observacion?: string;

	// Relación
	terreno_id?: number;

	// --- CAMPOS NUEVOS (QUE VIENEN DEL BACKEND) ---
	nombre_barrio?: string; // <--- Nuevo
	nombre_socio?: string; // <--- Nuevo

	// Mantén estos por compatibilidad si tienes código viejo,
	// pero ya no son los principales para la tabla
	terreno_data?: Terreno;
	socio_data?: Socio;
	tiene_medidor_fisico?: boolean;
	esta_activo?: boolean;
}
