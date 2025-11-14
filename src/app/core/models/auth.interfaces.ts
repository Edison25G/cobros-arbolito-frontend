import { Role } from './role.enum';

// Lo que enviamos al servicio
export interface LoginCredentials {
	username: string;
	password: string; // <--- AQUI ESTÁ LA CORRECIÓN
}

// Lo que el servicio nos responde (simulado)
export interface LoginResponse {
	success: boolean;
	message: string;
	token?: string;
	role?: Role | null;
}
