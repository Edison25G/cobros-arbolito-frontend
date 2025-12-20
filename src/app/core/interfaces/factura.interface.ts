import { Socio } from '../models/socio.interface';
import { Medidor } from '../models/medidor.interface';

/**
 * DTO para GENERAR UNA SOLA FACTURA (Caso manual o específico).
 * Se usa si decides facturar a una sola persona.
 */
export interface GenerarFacturaDTO {
	lectura_id: number;
	fecha_emision: string; // "YYYY-MM-DD"
	fecha_vencimiento?: string;
	usuario_id: number; // El tesorero que genera
}

/**
 * ✅ DTO para la EMISIÓN MASIVA (Lo que usaremos en el botón verde).
 * En lugar de enviar un ID, enviamos el MES y AÑO.
 */
export interface GenerarEmisionDTO {
	mes: number; // Ej: 12
	anio: number; // Ej: 2025
	usuario_id: number;
}

/**
 * Interfaz para la tabla de "Lecturas Pendientes" (Pre-visualización).
 * Contiene los datos de la lectura Y los cálculos financieros.
 */
export interface LecturaPendiente {
	id: number; // ID de la lectura
	fecha_lectura: string; // "YYYY-MM-DD"

	// Datos del Consumo
	lectura_anterior: number;
	lectura_actual: number;
	consumo: number; // m3

	// Relaciones (Pueden venir completas o simplificadas)
	medidor: string | Medidor; // Puede ser el código "MED-001" o el objeto completo
	socio: string | Socio; // Puede ser "Juan Perez" o el objeto completo
	cedula?: string; // Útil para mostrar en tabla

	// 💰 CAMPOS FINANCIEROS (Calculados)
	// Los ponemos opcionales (?) o obligatorios según si el backend ya los manda calculados
	monto_agua: number; // $3.50
	multas_mingas: number; // $10.00
	detalle_multas?: string[]; // ["Falta Minga 1", "Atraso Asamblea"]
	total_pagar?: number; // Suma total (Agua + Multas)
}

/**
 * Respuesta del Backend al terminar la emisión.
 */
export interface ResultadoEmisionResponse {
	mensaje: string; // "Se generaron 50 facturas"
	total_facturas: number; // 50
	total_dinero: number; // 850.00
	errores?: string[]; // Lista de errores si falló alguno
}
