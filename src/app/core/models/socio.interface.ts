import { RolUsuario } from './role.enum';

export interface Socio {
	id: number;
	cedula: string;
	nombres: string;
	apellidos: string;
	email: string | null;
	telefono?: string;
	barrio_id: number;
	direccion: string;
	rol: RolUsuario; // Usa el Enum
	esta_activo: boolean;
}
