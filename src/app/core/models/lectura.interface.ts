// Define la estructura de datos que enviamos al registrar una lectura
export interface LecturaPayload {
	idSocio: number;
	valorLectura: number;
	fechaLectura: Date;
}

// Podríamos añadir una respuesta, pero por ahora un 'any' simple nos sirve
export interface LecturaResponse {
	success: boolean;
	message: string;
	idLectura?: number;
}
