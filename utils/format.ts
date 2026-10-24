export function formatCount(value: number): string {
  return value.toLocaleString('es-DO');
}

export function whatsappNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}
