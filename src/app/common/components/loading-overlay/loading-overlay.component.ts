import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoadingService } from '@core/services/loading.service'; // Importa nuestro servicio

@Component({
	selector: 'amc-loading-overlay', // Asumiendo 'ca' como prefijo
	standalone: true,
	imports: [CommonModule, ProgressSpinnerModule],
	templateUrl: './loading-overlay.component.html',
})
export class LoadingOverlayComponent {
	// Inyectamos el servicio
	private loadingService = inject(LoadingService);

	// Hacemos el observable 'isLoading$' público para usarlo en el HTML
	public isLoading$ = this.loadingService.isLoading$;
}
