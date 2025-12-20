import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select'; // ✅ CAMBIO: Usamos SelectModule
import { PasswordModule } from 'primeng/password';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmationService, MessageService } from 'primeng/api';

// Modelos y Servicios
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../core/models/usuario.interface';
import { RolUsuario } from '../../../core/models/role.enum';

@Component({
	selector: 'app-usuarios',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		TableModule,
		ButtonModule,
		DialogModule,
		InputTextModule,
		SelectModule, // ✅ CAMBIO: SelectModule en imports
		PasswordModule,
		TagModule,
		IconFieldModule,
		InputIconModule,
		ConfirmDialogModule,
		ToastModule,
	],
	providers: [ConfirmationService, MessageService],
	templateUrl: './usuarios.component.html',
	styleUrls: ['./usuarios.component.css'],
})
export class UsuariosComponent implements OnInit {
	private usuarioService = inject(UsuarioService);
	private messageService = inject(MessageService);
	private confirmationService = inject(ConfirmationService);
	private fb = inject(FormBuilder);

	usuarios: Usuario[] = [];
	loading = true;
	dialogVisible = false;
	userForm!: FormGroup;
	isEditMode = false;

	// Opciones para el Select
	roles = [
		{ label: 'Administrador', value: RolUsuario.ADMIN },
		{ label: 'Tesorero', value: RolUsuario.TESORERO },
		{ label: 'Operador', value: RolUsuario.OPERADOR },
	];

	ngOnInit(): void {
		this.loadUsuarios();
		this.initForm();
	}

	initForm(): void {
		this.userForm = this.fb.group({
			id: [null],
			first_name: ['', Validators.required],
			last_name: ['', Validators.required],
			username: ['', Validators.required],
			email: ['', [Validators.email]],
			rol: [null, Validators.required],
			password: [''],
		});
	}

	loadUsuarios(): void {
		this.loading = true;
		this.usuarioService.getAll().subscribe({
			next: (data) => {
				this.usuarios = data;
				this.loading = false;
			},
			error: (err) => {
				console.error(err);
				this.loading = false;
				// Datos falsos de prueba
				this.usuarios = [
					{
						id: 1,
						username: 'admin',
						first_name: 'Super',
						last_name: 'Admin',
						email: 'admin@arbolito.com',
						rol: RolUsuario.ADMIN,
						is_active: true,
					},
				];
			},
		});
	}

	openNew(): void {
		this.userForm.reset();
		this.isEditMode = false;
		this.dialogVisible = true;
		this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
		this.userForm.get('password')?.updateValueAndValidity();
	}

	editUsuario(user: Usuario): void {
		this.isEditMode = true;
		this.userForm.patchValue(user);
		this.dialogVisible = true;
		this.userForm.get('password')?.clearValidators();
		this.userForm.get('password')?.updateValueAndValidity();
	}

	saveUsuario(): void {
		if (this.userForm.invalid) {
			this.userForm.markAllAsTouched();
			return;
		}

		const userData = this.userForm.value;

		if (this.isEditMode && userData.id) {
			// EDITAR
			this.usuarioService.update(userData.id, userData).subscribe({
				next: () => {
					this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado' });
					this.loadUsuarios();
					this.dialogVisible = false;
				},
				error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' }),
			});
		} else {
			// CREAR
			this.usuarioService.create(userData).subscribe({
				next: () => {
					this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado correctamente' });
					this.loadUsuarios();
					this.dialogVisible = false;
				},
				error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear.' }),
			});
		}
	}

	deleteUsuario(user: Usuario): void {
		this.confirmationService.confirm({
			message: `¿Estás seguro de eliminar a ${user.username}?`,
			header: 'Confirmar Eliminación',
			icon: 'pi pi-exclamation-triangle',
			accept: () => {
				if (user.id) {
					this.usuarioService.delete(user.id).subscribe({
						next: () => {
							this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Usuario eliminado' });
							this.loadUsuarios();
						},
						error: () =>
							this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' }),
					});
				}
			},
		});
	}
}
