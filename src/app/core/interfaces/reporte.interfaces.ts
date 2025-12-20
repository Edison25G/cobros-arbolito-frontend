// Esta interfaz es la que usará tu componente "Home/Resumen"
export interface ReporteGeneral {
	sociosActivos: number;
	sociosEnMora: number;
	totalRecaudadoMes: number;
	totalDeuda: number;
	recaudacionUltimos6Meses: number[];
}

// --- ¡NUEVA INTERFAZ! ---
// Esta es la que usará tu nuevo componente de "Reportes"
// Representa una fila en la tabla de facturas
export interface FacturaReporte {
	id: number;
	fecha_emision: string; // "YYYY-MM-DD"
	fecha_vencimiento: string; // "YYYY-MM-DD"
	socio_nombres: string;
	socio_apellidos: string;
	socio_cedula: string;
	total: number;
	estado: 'Pendiente' | 'Pagada' | 'Anulada';
	clave_acceso_sri: string | null;
}
