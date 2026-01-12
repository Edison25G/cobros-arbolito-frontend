/**
 * Lo que enviamos a la API para registrar una lectura.
 * Coincide con RegistrarLecturaSerializer de Django.
 */
export interface RegistrarLecturaDTO {
	medidor_id: number;
	lectura_actual: number;
	fecha_lectura: string; // Formato YYYY-MM-DD
	// operador_id: number; // El ID del usuario que está registrando
}

/**
 * Lo que la API nos devuelve al registrar.
 * Coincide con la 'respuesta_data' de la APIView.
 */
export interface LecturaResponse {
	id: number;
	medidor_id: number;
	consumo_del_mes: number;
}

export interface LecturaView {
	id: number;
	fecha: string;
	medidor_codigo: string;
	socio_nombre: string;
	lectura_anterior: number;
	lectura_actual: number;
	consumo: number;
	estado: 'Registrada' | 'Facturada';
}
