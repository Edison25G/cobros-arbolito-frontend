// export interface LoginRequest {
// 	username: string;
// 	password: string;
// }

// export interface UserData {
// 	id: number;
// 	username: string;
// 	first_name: string;
// 	last_name: string;
// 	email: string;
// 	rol?: string;
// }

// export interface LoginResponse {
// 	message: string;
// 	user: UserData;
// }

// src/app/core/interfaces/auth.interface.ts

export interface LoginRequest {
	username: string;
	password: string;
}

export interface UserData {
	id: number;
	username: string;
	first_name: string;
	last_name: string;
	email: string;
	rol?: string;
}

// ⬅️ ¡AÑADE ESTA INTERFAZ!
// Esta es la respuesta que nos da el endpoint /api/v1/token/
export interface TokenResponse {
	access: string;
	refresh: string;
}

// (Puedes borrar 'export interface LoginResponse' si todavía existe aquí)
