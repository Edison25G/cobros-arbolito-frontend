import { Barrio } from './barrio.interface'; // Asegúrate de tener esta interfaz
import { Medidor } from '../models/medidor.interface';

export interface Terreno {
	id?: number; // Opcional al crear
	socio_id: number; // Solo enviamos el ID del socio
	barrio_id: number; // ✅ IMPORTANTE: Enviamos el ID del barrio, no el nombre
	direccion: string;

	// Para mostrar datos en tablas (cuando el backend responde objetos completos)
	barrio_data?: Barrio;
	medidor?: Medidor; // Relación OneToOne (puede venir null si es lote vacío)

	tiene_medidor?: boolean; // Solo visual para el frontend
}
