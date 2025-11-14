import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { Usuario } from '../models/usuario.interface';
import { Role } from '../models/role.enum';

// --- DATOS FALSOS (MOCK DATA) ---
const MOCK_USUARIOS: Usuario[] = [
	{
		id: 1,
		username: 'admin',
		email: 'admin@el-arbolito.com',
		role: Role.Admin,
		activo: true,
	},
	{
		id: 2,
		username: 'secretario1',
		email: 'secretario.juan@el-arbolito.com',
		role: Role.Secretario,
		activo: true,
	},
	{
		id: 3,
		username: 'secretario2',
		email: 'secretaria.ana@el-arbolito.com',
		role: Role.Secretario,
		activo: false, // Un usuario inactivo
	},
	// (Los 'Socios' no son usuarios del sistema, son clientes)
];
// --- FIN DE LOS DATOS FALSOS ---

@Injectable({
	providedIn: 'root',
})
export class UsuarioService {
	constructor() {}

	/**
	 * Simula una llamada API para obtener todos los usuarios del sistema.
	 * Tarda 500ms en responder.
	 */
	getUsuarios(): Observable<Usuario[]> {
		console.log('UsuarioService: Simulando carga de usuarios...');

		return timer(500).pipe(
			map(() => {
				console.log('UsuarioService: Carga simulada completa.');
				return MOCK_USUARIOS;
			}),
		);
	}

	// (Aquí irían los métodos simulados de create, update, delete)
	// crearUsuario(usuario: any): Observable<any> { ... }
	// actualizarUsuario(id: number, usuario: any): Observable<any> { ... }
}
