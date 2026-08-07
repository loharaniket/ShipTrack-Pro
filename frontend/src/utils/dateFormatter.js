export const parseJavaDate = (input) => {
  if (!input) return null;
  
  // Handle Jackson array serialization: [year, month, day, hour, minute, second, nanoseconds]
  if (Array.isArray(input)) {
    // Java months are 1-12, JS Date months are 0-11
    const [year, month, day, hour = 0, minute = 0, second = 0] = input;
    return new Date(year, month - 1, day, hour, minute, second);
  }
  
  // Handle Java string serialization with bracketed timezone (e.g. "[UTC]")
  if (typeof input === 'string') {
    const sanitizedString = input.replace(/\[.*?\]$/, '');
    return new Date(sanitizedString);
  }
  
  // Fallback (for timestamps or normal Date objects)
  return new Date(input);
};

export const formatDateTime = (dateInput) => {
  try {
    const date = parseJavaDate(dateInput);
    if (!date || isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString();
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDateOnly = (dateInput) => {
  try {
    const date = parseJavaDate(dateInput);
    if (!date || isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString();
  } catch (error) {
    return 'Invalid Date';
  }
};
