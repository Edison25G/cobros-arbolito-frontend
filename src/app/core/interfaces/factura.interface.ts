import { Socio } from '../models/socio.interface';
import { Medidor } from '../models/medidor.interface';

/**
 * Lo que enviamos a la API POST /api/v1/facturas/generar/
 * Coincide con GenerarFacturaSerializer de Django.
 */
export interface GenerarFacturaDTO {
	lectura_id: number;
	fecha_emision: string; // "YYYY-MM-DD"
	fecha_vencimiento?: string; // Opcional
}

/**
 * Lo que la API nos devuelve al generar una factura.
 * Coincide con la 'respuesta_data' de la APIView.
 */
export interface FacturaGeneradaResponse {
	id: number;
	socio_id: number;
	estado: string; // "Pendiente"
	total: string; // "5.00"
	detalles: string[]; // ["Consumo base...", "Consumo excedente..."]
}

/**
 * ¡NUEVO! Interfaz para la tabla de "Lecturas Pendientes".
 * (Esta la simularemos en el servicio).
 */
export interface LecturaPendiente {
	id: number; // El ID de la lectura
	fecha_lectura: string; // "YYYY-MM-DD"
	consumo_del_mes_m3: number;
	medidor: Medidor; // Objeto Medidor (simulado)
	socio: Socio; // Objeto Socio (real)
}
