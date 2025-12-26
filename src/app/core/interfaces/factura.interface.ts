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
