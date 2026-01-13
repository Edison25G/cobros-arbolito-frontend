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
	rol: RolUsuario | string; // Puede venir como Enum o como texto del backend
	esta_activo: boolean;
	usuario_id?: number; // ID del usuario asociado (opcional)
}
