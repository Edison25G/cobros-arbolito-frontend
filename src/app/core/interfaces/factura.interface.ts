// core/interfaces/factura.interface.ts

// Para el botón de generar emisión
export interface GenerarEmisionDTO {
	mes: number;
	anio: number;
	usuario_id: number;
}

// LO QUE DEBE ENVIAR EL BACKEND PARA LA TABLA
export interface LecturaPendiente {
	id: number;
	fecha_lectura: string;

	lectura_anterior: number;
	lectura_actual: number;
	consumo: number;

	medidor_codigo: string;
	socio_nombre: string;
	cedula: string;

	monto_agua: number;
	multas_mingas: number;
	detalle_multas?: string[];
	total_pagar: number;
}

export interface ComprobanteSRI {
	id: number;
	numero: string; // Ej: 001-001-000000123
	socio_nombre: string;
	fecha_emision: string;
	total: number;
	estado_sri: 'NO_ENVIADO' | 'EN_PROCESO' | 'AUTORIZADO' | 'DEVUELTA' | 'RECHAZADA';
	mensaje_error?: string;
	clave_acceso?: string;
}
