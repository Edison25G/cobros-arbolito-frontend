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
	rubro: 'AGUA' | 'MINGA' | 'EVENTO' | 'MULTA'; // <--- AGREGAR ESTO
}

export interface ReporteCarteraItem {
	socio_id: number;
	nombre: string;
	identificacion: string;
	barrio: string;
	total_deuda: number;
	facturas_pendientes: number;
	// Desglose de la deuda por antigüedad
	corriente: number; // Del mes actual
	vencido_1_3: number; // 1 a 3 meses de mora
	incobrable: number; // Más de 3 meses
}

export interface ReporteCierreCaja {
	rango: {
		inicio: string;
		fin: string;
	};
	total_general: number;
	desglose_medios: {
		EFECTIVO: number;
		TRANSFERENCIA: number;
		OTROS: number;
	};
	cantidad_transacciones: number;
}
