// core/interfaces/factura.interface.ts

export interface GenerarEmisionDTO {
	mes: number;
	anio: number;
	usuario_id: number;
}

// ESTA ES LA CLAVE: Ajustada para recibir lo que manda el Backend
export interface LecturaPendiente {
	socio_id: number;
	nombres: string;
	identificacion: string;
	lectura_id: string; // "0 -> 20"
	lectura_real_id: number;

	medidor_id: number;
	medidor_codigo: string;
	consumo: string; // "Consumo de Agua Potable"
	valor_agua: number; // 3.0
	subtotal: number;

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
