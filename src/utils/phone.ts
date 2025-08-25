export function normalizePhoneForDial(phone: string): string {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // If it starts with Egyptian country code (20), add +
  if (digitsOnly.startsWith('20') && digitsOnly.length >= 12) {
    return `+${digitsOnly}`;
  }
  
  // If it's a local Egyptian number starting with 01, convert to international
  if (digitsOnly.startsWith('01') && digitsOnly.length === 11) {
    return `+2${digitsOnly}`;
  }
  
  // If it already looks like an international number, add +
  if (digitsOnly.length >= 10 && !digitsOnly.startsWith('+')) {
    return `+${digitsOnly}`;
  }
  
  return digitsOnly;
}

export function getWhatsAppLink(phone: string, message?: string): string {
  const normalizedPhone = normalizePhoneForDial(phone);
  const cleanPhone = normalizedPhone.replace(/\D/g, '');
  
  let url = `https://wa.me/${cleanPhone}`;
  if (message) {
    url += `?text=${encodeURIComponent(message)}`;
  }
  
  return url;
}

export function getTelLink(phone: string): string {
  const normalizedPhone = normalizePhoneForDial(phone);
  return `tel:${normalizedPhone}`;
}

export function validatePhone(phone: string): boolean {
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}
