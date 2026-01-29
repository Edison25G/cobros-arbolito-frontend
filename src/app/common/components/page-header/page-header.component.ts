import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
	selector: 'app-page-header',
	standalone: true,
	imports: [CommonModule, ButtonModule],
	templateUrl: './page-header.component.html',
})
export class PageHeaderComponent {
	@Input() title = '';
	@Input() subtitle = '';
	@Input() buttonLabel = '';
	@Input() buttonIcon = 'pi pi-plus';
	@Input() showButton = true;

	@Output() actionClick = new EventEmitter<void>();

	onButtonClick() {
		this.actionClick.emit();
	}
}
