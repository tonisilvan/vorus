export interface User {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  /** scrypt hash en formato `salt:hash` hex */
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
}
