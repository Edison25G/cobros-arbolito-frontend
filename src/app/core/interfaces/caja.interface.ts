// core/interfaces/caja.interface.ts

// 1. Lo que recibimos al buscar un socio
export interface EstadoCuentaResponse {
	encontrado: boolean;
	socio: {
		id: number;
		nombres: string;
		apellidos: string;
		cedula: string;
		barrio: string;
		estado: string; // 'ACTIVO' | 'INACTIVO'
	};
	deudas: DeudaItem[];
}

// 2. Cada item de la tabla de cobros (Legacy)
export interface DeudaItem {
	id: number;
	concepto: string;
	monto: number;
	vencimiento: string;
	tipo: 'AGUA' | 'MINGA' | 'OTROS';
	seleccionado?: boolean;
}

// 3. Lo que enviamos al backend para pagar (Legacy)
export interface RegistrarPagoDTO {
	deudas_ids: number[];
	metodo_pago: 'EFECTIVO' | 'TRANSFERENCIA';
	usuario_id: number;
}

// 4. Respuesta al pagar (Legacy)
export interface PagoResponse {
	success: boolean;
	ticket_numero: string;
	mensaje: string;
}

// =========================================
// 🆕 5. TRANSFERENCIAS PENDIENTES (CORREGIDO)
// =========================================
// Esta interfaz debe coincidir EXACTAMENTE con el JSON del backend
export interface TransferenciaPendiente {
	pago_id: number; // ID del pago en tabla 'pagos'
	factura_id: number; // ID de la factura relacionada
	socio: string; // "Nombre Apellido"
	cedula: string;
	banco_fecha: string; // Fecha de subida
	monto: number;
	referencia: string; // Número de comprobante
	comprobante_url: string | null; // URL de la foto
}

// =========================================
// 🆕 NUEVAS INTERFACES PARA COBROS MIXTOS
// =========================================

// 6. Item de pago individual (para pagos mixtos)
export interface PagoItem {
	metodo: 'EFECTIVO' | 'TRANSFERENCIA';
	monto: number;
	referencia?: string; // Solo requerido para TRANSFERENCIA
}

// 7. DTO para registrar cobro (nuevo endpoint)
export interface RegistrarCobroDTO {
	factura_id: number;
	pagos: PagoItem[];
}

// =========================================
// 🆕 RESPUESTA COMPLETA DE COBRO CON COMPROBANTE
// =========================================

// 8. Datos de la factura en el comprobante
export interface ComprobanteFactura {
	id: number;
	fecha_emision: string;
	subtotal: string;
	total: string;
	clave_acceso_sri: string;
	estado_sri: 'AUTORIZADO' | 'PENDIENTE' | 'RECHAZADO';
}

// 9. Datos del socio en el comprobante
export interface ComprobanteSocio {
	cedula: string;
	nombres: string;
	apellidos: string;
	direccion: string;
}

// 10. Pago registrado en el comprobante
export interface ComprobantePago {
	metodo: 'EFECTIVO' | 'TRANSFERENCIA';
	monto: string;
}

// 11. Comprobante completo
export interface Comprobante {
	factura: ComprobanteFactura;
	socio: ComprobanteSocio;
	pagos: ComprobantePago[];
}

// 12. Respuesta del endpoint de cobro (POST /api/v1/cobros/registrar/)
export interface CobroResponse {
	mensaje: string;
	factura_id: number;
	nuevo_estado: 'PAGADA' | 'PENDIENTE';
	total_pagado: string;
	comprobante: Comprobante;
}

// =========================================
// 🆕 INTERFAZ PARA FACTURAS PENDIENTES
// =========================================

// 13. Factura pendiente de cobro (para tabla principal de caja)
export interface FacturaPendiente {
	factura_id: number;
	socio: string;
	cedula: string;
	fecha_emision: string;
	medidor: string;
	consumo: string;
	agua: string;
	multas: string;
	total: string;
	estado_sri: string;
	estado_pago: string;

	// Agregamos estos opcionales por si los necesitas en el futuro
	direccion?: string;
	clave_acceso_sri?: string;
}
