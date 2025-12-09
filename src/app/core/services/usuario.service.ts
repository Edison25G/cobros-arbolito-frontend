import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './../../environments/environment.development';

// ✅ IMPORTAMOS LA INTERFAZ Y EL ENUM
import { Usuario } from '../models/usuario.interface';

@Injectable({
	providedIn: 'root',
})
export class UsuarioService {
	private http = inject(HttpClient);
	// Asegúrate de que este endpoint coincida con tu backend (ej. /usuarios/ o /users/)
	private apiUrl = `${environment.apiUrl}/usuarios/`;

	getAll(): Observable<Usuario[]> {
		return this.http.get<Usuario[]>(this.apiUrl);
	}

	create(usuario: Usuario): Observable<Usuario> {
		return this.http.post<Usuario>(this.apiUrl, usuario);
	}

	update(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
		return this.http.patch<Usuario>(`${this.apiUrl}${id}/`, usuario);
	}

	delete(id: number): Observable<void> {
		return this.http.delete<void>(`${this.apiUrl}${id}/`);
	}
}
