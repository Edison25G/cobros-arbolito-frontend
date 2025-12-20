import { RolUsuario } from './role.enum';

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
