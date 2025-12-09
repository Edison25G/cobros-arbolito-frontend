import { RolUsuario } from './role.enum';

// Define la estructura de un objeto Usuario (del sistema)
export interface Usuario {
	id?: number;
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	password?: string; // Solo para crear
	rol: RolUsuario; // Para saber si es Tesorero u Operador
	is_active?: boolean;
}
