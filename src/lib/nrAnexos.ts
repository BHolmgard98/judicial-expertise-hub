// Constantes e labels para Anexos NR15 e NR16

export const NR15_ANEXOS = {
  1: "RUÍDO CONTÍNUO",
  2: "RUÍDO DE IMPACTO",
  3: "CALOR",
  5: "RADIAÇÕES IONIZANTES",
  6: "PRESSÕES",
  7: "RADIAÇÕES NÃO-IONIZANTES",
  8: "VIBRAÇÃO",
  9: "FRIO",
  10: "UMIDADE",
  11: "AG. QUÍMICOS - LT",
  12: "POEIRAS",
  13: "AG. QUÍMICOS",
  14: "AG. BIOLÓGICOS",
} as const;

export const NR16_ANEXOS = {
  1: "EXPLOSIVOS",
  2: "INFLAMÁVEIS",
  3: "SEGURANÇA/ROUBO",
  4: "ENERGIA ELÉTRICA",
  5: "MOTOCICLETA",
  6: "AGENTE DE TRANSITO (NOVO)",
  "*": "MATERIAL RADIOATIVO",
} as const;

export const NR15_KEYS = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const;
export const NR16_KEYS = [1, 2, 3, 4, 5] as const;

export type NR15Key = keyof typeof NR15_ANEXOS;
export type NR16Key = keyof typeof NR16_ANEXOS;

export const getNR15Label = (key: number): string => {
  return NR15_ANEXOS[key as NR15Key] || `Anexo ${key}`;
};

export const getNR16Label = (key: number | string): string => {
  return NR16_ANEXOS[key as NR16Key] || `Anexo ${key}`;
};
