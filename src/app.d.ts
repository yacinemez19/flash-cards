declare global {
	namespace App {
		interface Locals {
			userId: number | null;
			username: string | null;
		}
	}
}

export {};
