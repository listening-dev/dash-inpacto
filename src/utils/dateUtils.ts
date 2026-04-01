// Função para formatar uma data no formato DD/MM/YYYY
export const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Função para formatar uma data no formato DD/MM
export const formatShortDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}`;
};

// Função para subtrair dias de uma data
export const subtractDaysFromDate = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

// Função para converter string de data DD/MM para objeto Date
export const parseDateShort = (dateStr: string): Date => {
  const [day, month] = dateStr.split('/').map(Number);
  const year = new Date().getFullYear();
  return new Date(year, month - 1, day);
};

// Função para converter string de data DD/MM/YYYY para objeto Date
export const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
};

// Função para verificar se uma data está dentro de um período (em dias) a partir de hoje
export const isDateInPeriod = (dateStr: string, days: number, format: 'short' | 'full' = 'short'): boolean => {
  const currentDate = new Date();
  const fromDate = subtractDaysFromDate(currentDate, days);
  
  const date = format === 'short' 
    ? parseDateShort(dateStr)
    : parseDate(dateStr);
  
  return date >= fromDate;
};