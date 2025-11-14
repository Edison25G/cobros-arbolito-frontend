import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class LoadingService {
	// Un 'BehaviorSubject' guarda el último estado (true/false)
	private _isLoading$ = new BehaviorSubject<boolean>(false);

	// Hacemos público el estado 'isLoading' como un Observable
	public readonly isLoading$ = this._isLoading$.asObservable();

	constructor() {}

	// Método para MOSTRAR el spinner
	show(): void {
		this._isLoading$.next(true);
	}

	// Método para OCULTAR el spinner
	hide(): void {
		this._isLoading$.next(false);
	}
}
