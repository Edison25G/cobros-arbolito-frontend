import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class ValidatorUtils {
	static isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	static isValidPassword(password: string): boolean {
		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
		return passwordRegex.test(password);
	}
}
