import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '@common/components';
import { ToastModule } from 'primeng/toast';

@Component({
	selector: 'amc-auth-layout',
	imports: [RouterOutlet, FooterComponent, ToastModule],
	templateUrl: './auth-layout.component.html',
	styleUrl: './auth-layout.component.css',
})
export default class AuthLayoutComponent {}
