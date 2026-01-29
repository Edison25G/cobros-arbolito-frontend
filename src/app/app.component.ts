import { Component, OnInit, inject } from '@angular/core'; // <-- 1. IMPORTAR inject
import {
	RouterOutlet,
	Router,
	NavigationEnd, // <-- 'NavigationStart' eliminado
	NavigationCancel,
	NavigationError,
} from '@angular/router';
import { CommonModule } from '@angular/common'; // <-- 3. IMPORTAR CommonModule
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { filter } from 'rxjs/operators'; // <-- 4. IMPORTAR filter de RxJS

// --- Tus Imports ---
import { LoadingOverlayComponent } from './common/components/loading-overlay/loading-overlay.component';
import { LoadingService } from './core/services/loading.service'; // <-- 5. IMPORTAR LoadingService

@Component({
	selector: 'amc-root', // (Puedes dejar este selector como 'amc-root' o 'ca-root', no afecta la lógica)
	standalone: true,
	imports: [
		CommonModule, // <-- 3. AÑADIR CommonModule
		RouterOutlet,
		ButtonModule,
		ToastModule,
		ConfirmDialogModule,
		LoadingOverlayComponent,
	],
	providers: [],
	templateUrl: './app.component.html',
	styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
	title = 'cobros-arbolito';

	// --- 6. INYECTAR Servicios ---
	private router = inject(Router);
	private loadingService = inject(LoadingService);

	constructor() {}

	ngOnInit(): void {
		// --- 7. LLAMAR al listener ---
		this.listenToNavigationEvents();
	}

	/**
	 * --- 8. NUEVA FUNCIÓN ---
	 * Escucha los eventos del router para apagar el spinner
	 * de pantalla completa (LoadingOverlay)
	 */
	private listenToNavigationEvents(): void {
		this.router.events
			.pipe(
				// Filtrar solo los eventos que nos interesan
				filter(
					(event) =>
						event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError,
				),
			)
			.subscribe(() => {
				// Apagar el spinner
				this.loadingService.hide();
			});
	}
}
