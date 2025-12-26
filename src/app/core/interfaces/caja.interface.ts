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
