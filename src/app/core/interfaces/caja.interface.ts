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

// 2. Cada item de la tabla de cobros
export interface DeudaItem {
	id: number; // ID de la factura o multa
	concepto: string; // "Consumo Agua - Nov 2025"
	monto: number; // 3.50
	vencimiento: string; // "2025-12-05"
	tipo: 'AGUA' | 'MINGA' | 'OTROS';
	seleccionado?: boolean; // Para el checkbox del frontend
}

// 3. Lo que enviamos al backend para pagar
export interface RegistrarPagoDTO {
	deudas_ids: number[]; // [101, 103]
	metodo_pago: 'EFECTIVO' | 'TRANSFERENCIA';
	usuario_id: number; // El cajero que cobra
}

// 4. Respuesta al pagar
export interface PagoResponse {
	success: boolean;
	ticket_numero: string; // "TKT-2025-001"
	mensaje: string;
}

// 5. Para la pestaña de Transferencias (Opcional por ahora)
export interface TransferenciaPendiente {
	id: number;
	socio_nombre: string;
	fecha: string;
	monto: number;
	comprobante_url: string;
	banco_origen: string;
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
	id: number;
	numero_factura: string;
	fecha_emision: string;
	socio_id: number;
	socio_nombre: string;
	socio_cedula: string;
	medidor_codigo?: string;
	consumo?: number;
	monto_agua: number;
	multas: number;
	total: number;
	estado: 'PENDIENTE' | 'PAGADA' | 'ANULADA';
	dias_vencido?: number;
}
