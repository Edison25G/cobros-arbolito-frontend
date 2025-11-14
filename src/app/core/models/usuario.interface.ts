import { Role } from './role.enum';

// Define la estructura de un objeto Usuario (del sistema)
export interface Usuario {
	id: number;
	username: string;
	email: string;
	role: Role;
	activo: boolean; // Para habilitar o deshabilitar cuentas
}
