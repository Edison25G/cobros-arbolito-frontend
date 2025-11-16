import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// --- Servicios y Modelos ---
import { UsuarioService } from '@core/services/usuario.service';
import { Usuario } from '@core/models/usuario.interface';
import { RolUsuario } from '@core/models/role.enum';
import { ErrorService } from '../../../auth/core/services/error.service';

// --- Imports de PrimeNG ---
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';

@Component({
	selector: 'amc-usuarios',
	standalone: true,
	imports: [
		CommonModule,
		// --- Módulos de PrimeNG ---
		TableModule,
		ButtonModule,
		TooltipModule,
		TagModule,
	],
	templateUrl: './usuarios.component.html',
	styleUrls: ['./usuarios.component.css'],
})
export class UsuariosComponent implements OnInit {
	// --- Inyección de Servicios ---
	private usuarioService = inject(UsuarioService);
	private errorService = inject(ErrorService);

	// --- Estado del Componente ---
	public usuarios: Usuario[] = [];
	public isLoading = true;

	// Hacemos el Enum visible para el template
	public Role = RolUsuario;

	constructor() {}

	/**
	 * ngOnInit: Se ejecuta al cargar el componente.
	 */
	ngOnInit(): void {
		this.loadUsuarios();
	}

	/**
	 * Llama al servicio para cargar los usuarios del sistema
	 */
	loadUsuarios(): void {
		this.isLoading = true; // Activa el spinner

		this.usuarioService.getUsuarios().subscribe({
			next: (data) => {
				// Éxito: Guarda los datos y apaga el spinner
				this.usuarios = data;
				this.isLoading = false;
				console.log('Usuarios cargados:', this.usuarios);
			},
			error: (err) => {
				// Error: Apaga el spinner y muestra un error
				console.error('Error al cargar usuarios:', err);
				this.isLoading = false;
				this.errorService.showError('No se pudieron cargar los usuarios.');
			},
		});
	}

	// --- Futuros Métodos ---

	crearUsuario(): void {
		console.log('Abriendo modal para crear usuario...');
		// (Lógica futura para abrir un <p-dialog>)
	}

	editarUsuario(usuario: Usuario): void {
		console.log('Editando usuario:', usuario.id);
	}

	cambiarEstado(usuario: Usuario): void {
		console.log('Cambiando estado de usuario:', usuario.id);
		// (Aquí iría la lógica para activar/desactivar)
	}
}
