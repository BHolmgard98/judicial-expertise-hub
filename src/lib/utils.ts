import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata uma data string no formato ISO (YYYY-MM-DD) sem problemas de timezone.
 * Evita o bug onde new Date("2025-11-25") é interpretado como UTC e
 * pode mostrar o dia anterior ao converter para timezone local.
 */
export function formatDateSafe(dateString: string | null | undefined, formatStr: string = "dd/MM/yyyy"): string {
  if (!dateString) return "-";
  
  // Divide a string de data em partes [ano, mês, dia]
  const parts = dateString.split("-");
  if (parts.length !== 3) return dateString;
  
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1; // Mês é 0-indexed
  const day = parseInt(parts[2]);
  
  // Cria Date object com timezone local explícito
  const date = new Date(year, month, day);
  
  return format(date, formatStr);
}
