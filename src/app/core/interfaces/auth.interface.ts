export interface LoginRequest {
	username: string;
	password: string;
}

export interface UserData {
	id: number;
	username: string;
	first_name: string;
	last_name: string;
	email: string;
	rol?: string;
}

export interface LoginResponse {
	message: string;
	user: UserData;
}
