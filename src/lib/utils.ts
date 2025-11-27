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

/**
 * Formata um valor numérico para o padrão brasileiro de moeda (R$ 1.234,56)
 */
export function formatCurrency(value: number | string | null | undefined): string {
  if (!value && value !== 0) return "";
  
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue)) return "";
  
  return numValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Remove formatação brasileira e converte para número
 * Aceita: "1.234,56" ou "1234,56" e retorna 1234.56
 */
export function parseCurrencyBR(value: string): number {
  if (!value) return 0;
  
  // Remove pontos (separador de milhares) e substitui vírgula por ponto
  const cleaned = value.replace(/\./g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

/**
 * Cria um Date object a partir de uma string ISO date (YYYY-MM-DD)
 * sem problemas de timezone. Adiciona T12:00:00 para evitar que
 * UTC midnight seja convertido para o dia anterior no timezone local.
 */
export function parseDateSafe(dateString: string | null | undefined): Date | undefined {
  if (!dateString) return undefined;
  
  // Remove qualquer parte de timezone se existir
  const dateOnly = dateString.split('T')[0];
  
  // Divide a string de data em partes [ano, mês, dia]
  const parts = dateOnly.split("-");
  if (parts.length !== 3) return undefined;
  
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1; // Mês é 0-indexed
  const day = parseInt(parts[2]);
  
  // Cria Date object com timezone local explícito (meio-dia para evitar problemas)
  return new Date(year, month, day, 12, 0, 0);
}

/**
 * Formata valor enquanto o usuário digita (padrão brasileiro)
 * Aplica formatação automaticamente: "1234.56" vira "1.234,56"
 */
export function formatCurrencyInput(value: string): string {
  // Remove tudo que não é número ou vírgula
  let cleaned = value.replace(/[^\d,]/g, "");
  
  // Garante apenas uma vírgula
  const parts = cleaned.split(",");
  if (parts.length > 2) {
    cleaned = parts[0] + "," + parts.slice(1).join("");
  }
  
  // Separa parte inteira e decimal
  const [integerPart, decimalPart] = cleaned.split(",");
  
  // Adiciona pontos como separador de milhares
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  // Retorna com decimal se existir
  return decimalPart !== undefined 
    ? `${formattedInteger},${decimalPart.slice(0, 2)}`
    : formattedInteger;
}
