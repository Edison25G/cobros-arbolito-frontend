// Estructura EXACTA de lo que te envía el Backend (Django/Python?)
export interface MedidorBackend {
	id: number;
	codigo: string;
	marca?: string;
	estado: string;
	lectura_inicial: number;
	terreno_id: number;
	observacion?: string;
	nombre_barrio: string;
	nombre_socio: string;
}

// Mantenemos estas para el gráfico (ese endpoint lo haremos luego)
export interface HistorialConsumo {
	mes: string;
	anio: number;
	consumo: number;
}
