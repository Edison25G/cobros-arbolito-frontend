// core/interfaces/reporte.interfaces.ts

// Para el Home (KPIs rápidos)
export interface ReporteGeneral {
	sociosActivos: number;
	sociosEnMora: number;
	totalRecaudadoMes: number;
	totalDeuda: number;
	recaudacionUltimos6Meses: number[];
}

// Para la tabla de Reportes y el PDF
export interface FacturaReporte {
	id: number;
	fecha: string;
	socio: string;
	concepto: string;
	monto: number;
	estado: 'Pagado' | 'Pendiente' | 'Anulado';
}
