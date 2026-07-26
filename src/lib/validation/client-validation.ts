export function validateFullName(name: string): string | null {
  if (!name || !name.trim()) {
    return "Full Name is required.";
  }
  if (name.trim().length < 2) {
    return "Full Name must be at least 2 characters.";
  }
  return null;
}

export function validateTitle(title: string): string | null {
  if (!title || !title.trim()) {
    return "Professional Title is required.";
  }
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address.";
  }
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone || !phone.trim()) return null;
  const phoneRegex = /^[\d\s+\-()]{7,20}$/;
  if (!phoneRegex.test(phone.trim())) {
    return "Please enter a valid phone number.";
  }
  return null;
}

export function validateUrl(url: string, fieldName = "Website"): string | null {
  if (!url || !url.trim()) return null;
  const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-./?%&=#]*)?$/i;
  if (!urlRegex.test(url.trim())) {
    return `Please enter a valid ${fieldName} URL.`;
  }
  return null;
}

export function validateDate(date: string): string | null {
  if (!date || !date.trim()) return null;
  if (date.trim().length > 30) {
    return "Date format is too long (e.g. Jan 2021 or Present).";
  }
  return null;
}

export function validateRequired(value: string, label: string): string | null {
  if (!value || !value.trim()) {
    return `${label} is required.`;
  }
  return null;
}
