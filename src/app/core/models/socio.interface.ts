import { RolUsuario } from './role.enum';

/**
 * Define la estructura de datos de un Socio en el frontend.
 * Coincide con el 'SocioSerializer' del backend.
 */
export interface Socio {
	id: number;
	cedula: string;
	nombres: string;
	apellidos: string;
	barrio: string;
	rol: RolUsuario; // Usa el Enum
	email: string | null;
	telefono: string | null;
	esta_activo: boolean;
}
