export interface Configuracion {
	id?: number; // Opcional porque al principio quizás no lo tengas
	nombreJunta: string;
	ruc: string;
	direccion: string;
	telefono: string;
	email: string;
	tarifaAguaMetroCubico: number;
	tarifaMoraMensual: number;
	valorIVA: number; // Ej: 0.15 para el 15%
}
