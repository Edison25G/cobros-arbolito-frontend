import { Socio } from './socio.interface';

export interface Medidor {
	id: number;
	// CAMBIO CLAVE: El backend manda 'socio_id', no 'socio'
	socio_id: number;
	codigo: string;
	esta_activo: boolean;
	observacion: string | null;
	tiene_medidor_fisico: boolean;

	// OPCIONAL: Esto lo llenaremos nosotros en el frontend
	socio_data?: Socio;
}
