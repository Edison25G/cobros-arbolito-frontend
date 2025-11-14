// Define la estructura de los ajustes del sistema
export interface Configuracion {
	id: number;
	nombreJunta: string;
	ruc: string;
	direccion: string;
	telefono: string;
	email: string;
	tarifaAguaMetroCubico: number; // Tarifa por m³
	tarifaMoraMensual: number; // Interés o multa por mora
	valorIVA: number; // Ej. 0.12 o 0.15
}
