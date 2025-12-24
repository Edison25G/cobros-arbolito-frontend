import { Terreno } from '../interfaces/terreno.interface';
import { Socio } from './socio.interface'; // Asegúrate de importar esto

export interface Medidor {
	id?: number;
	codigo: string;
	estado: string; // 'ACTIVO' | 'INACTIVO' | 'DANADO'
	lectura_inicial: number;
	marca?: string;
	observacion?: string;

	// Relación nueva
	terreno_id?: number;
	terreno_data?: Terreno;

	// --- AGREGAR ESTOS CAMPOS PARA CORREGIR TUS ERRORES ---

	// 1. Para el error "socio_data no existe"
	// (El backend podría enviarlo si navega Medidor -> Terreno -> Socio)
	socio_data?: Socio;

	// 2. Para el error "tiene_medidor_fisico no existe"
	tiene_medidor_fisico?: boolean;

	// 3. Para el error "esta_activo no existe"
	// (Lo usaremos como auxiliar para el switch del formulario)
	esta_activo?: boolean;
}
