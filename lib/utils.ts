import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
interface JwtPayload {
  [key: string]: any;
}
export function generateEightDigitNumber(): number {
  const min = 10000000;
  const max = 99999999; 
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function parseJwt(token: string): JwtPayload {
  const base64Url: string = token.split('.')[1];
  const base64: string = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload: string = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return JSON.parse(jsonPayload);
}
export function authcodecreator(length = 8) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}