import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG Imports (Solo los necesarios para ver y borrar)
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

// Modelos y Servicios
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../core/models/usuario.interface';
//import { RolUsuario } from '../../../core/models/role.enum';

@Component({
	selector: 'app-usuarios',
	standalone: true,
	imports: [
		CommonModule,
		TableModule,
		ButtonModule,
		TagModule,
		IconFieldModule,
		InputIconModule,
		InputTextModule,
		ConfirmDialogModule,
		ToastModule,
		TooltipModule,
	],
	providers: [ConfirmationService, MessageService],
	templateUrl: './usuarios.component.html',
	styleUrls: ['./usuarios.component.css'],
})
export class UsuariosComponent implements OnInit {
	private usuarioService = inject(UsuarioService);
	private messageService = inject(MessageService);
	private confirmationService = inject(ConfirmationService);

	usuarios: Usuario[] = [];
	loading = true;

	ngOnInit(): void {
		this.loadUsuarios();
	}

	loadUsuarios(): void {
		this.loading = true;
		this.usuarioService.getAll().subscribe({
			next: (data) => {
				this.usuarios = data;
				this.loading = false;
			},
			error: (err) => {
				console.error('Error cargando usuarios', err);
				this.loading = false;
				this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la lista.' });
			},
		});
		// 	error: (err) => {
		// 		console.warn('Backend no listo, usando datos falsos para visualización', err);

		// 		// 🔥 DATOS FALSOS TEMPORALES (Para que veas la tabla bonita)
		// 		this.usuarios = [
		// 			{
		// 				id: 1,
		// 				username: 'admin',
		// 				email: 'admin@arbolito.com',
		// 				first_name: 'Super',
		// 				last_name: 'Admin',
		// 				rol: RolUsuario.ADMIN, // Asegúrate que coincida con tu Enum o string
		// 				is_active: true,
		// 			},
		// 			{
		// 				id: 2,
		// 				username: 'tesorero1',
		// 				email: 'caja@arbolito.com',
		// 				first_name: 'Juan',
		// 				last_name: 'Pérez',
		// 				rol: RolUsuario.TESORERO,
		// 				is_active: true,
		// 			},
		// 		];

		// 		this.loading = false;
		// 		// Opcional: Mostrar mensaje de que son datos simulados
		// 		// this.messageService.add({ severity: 'warn', summary: 'Modo Prueba', detail: 'Mostrando datos simulados.' });
		// 	},
		// });
	}

	deleteUsuario(user: Usuario): void {
		// Protección: No permitir borrar al admin principal
		if (user.username === 'admin') {
			this.messageService.add({ severity: 'warn', summary: 'Protegido', detail: 'No puedes eliminar al Super Admin.' });
			return;
		}

		this.confirmationService.confirm({
			message: `¿Estás seguro de revocar el acceso a ${user.username}?`,
			header: 'Revocar Acceso',
			icon: 'pi pi-exclamation-triangle',
			acceptLabel: 'Sí, Revocar',
			rejectLabel: 'Cancelar',
			acceptButtonStyleClass: 'p-button-danger',
			accept: () => {
				if (user.id) {
					this.usuarioService.delete(user.id).subscribe({
						next: () => {
							this.messageService.add({
								severity: 'success',
								summary: 'Acceso Revocado',
								detail: 'El usuario ha sido eliminado del sistema.',
							});
							this.loadUsuarios();
						},
						error: () =>
							this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar.' }),
					});
				}
			},
		});
	}
}
