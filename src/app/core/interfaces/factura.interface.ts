// core/interfaces/factura.interface.ts

export interface GenerarEmisionDTO {
	mes: number;
	anio: number;
	usuario_id: number;
}

export interface LecturaPendiente {
	socio_id: number;
	nombres: string;
	identificacion: string;

	lectura_id: string;
	lectura_real_id: number;

	medidor_id: number;
	medidor_codigo: string;

	consumo: string;
	valor_agua: number;
	subtotal: number;
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
