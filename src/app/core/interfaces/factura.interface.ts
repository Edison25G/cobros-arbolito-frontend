// core/interfaces/factura.interface.ts

export interface GenerarEmisionDTO {
	mes: number;
	anio: number;
	usuario_id: number;
}

// ESTA ES LA CLAVE: Ajustada para recibir lo que manda el Backend
export interface LecturaPendiente {
	id: number; // Backend manda: lectura_id
	fecha_lectura?: string;

	lectura_anterior: number;
	lectura_actual: number;
	consumo: number;

	medidor_codigo: string; // Backend manda: codigo_medidor
	socio_nombre: string; // Backend manda: socio
	identificacion?: string;

	monto_agua: number; // Backend manda: valor_estimado
	multas_mingas: number;
	total_pagar: number; // Lo calculamos en el front
}

// ... (Puedes dejar ComprobanteSRI y lo demás si lo usas en otros lados)
export interface ComprobanteSRI {
	id: number;
	numero: string;
	socio_nombre: string;
	fecha_emision: string;
	total: number;
	estado_sri: string;
}
