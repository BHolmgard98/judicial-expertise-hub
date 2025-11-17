// Status color mapping with new order and colors
export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'AGENDAR PERÍCIA': 'bg-yellow-400 text-black',
    'AGUARDANDO PERÍCIA': 'bg-amber-100 text-black',
    'AGUARDANDO LAUDO': 'bg-orange-600 text-white',
    'AGUARDANDO ESCLARECIMENTOS': 'bg-sky-300 text-black',
    'LAUDO/ESCLARECIMENTOS ENTREGUES': 'bg-green-500 text-white',
    'SENTENÇA': 'bg-blue-900 text-white',
    'RECURSO ORDINÁRIO': 'bg-gray-400 text-black',
    'ACORDO APÓS REALIZAÇÃO DA PERÍCIA': 'bg-rose-800 text-white',
    'FINALIZADO EM ACORDO ANTES DA PERÍCIA': 'bg-red-600 text-white',
    'CERTIDÃO DE TRÂNSITO EM JULGADO': 'bg-orange-300 text-black',
    'SOLICITAÇÃO DE PAGAMENTO DE HONORÁRIOS': 'bg-purple-400 text-white',
    'HONORÁRIOS RECEBIDOS': 'bg-green-800 text-white',
    'REFAZER A PERÍCIA - ORDEM JUDICIAL': 'bg-yellow-400 text-black',
  };
  
  return colorMap[status] || 'bg-muted text-muted-foreground';
};

export const STATUS_OPTIONS = [
  'AGENDAR PERÍCIA',
  'AGUARDANDO PERÍCIA',
  'AGUARDANDO LAUDO',
  'AGUARDANDO ESCLARECIMENTOS',
  'LAUDO/ESCLARECIMENTOS ENTREGUES',
  'SENTENÇA',
  'RECURSO ORDINÁRIO',
  'ACORDO APÓS REALIZAÇÃO DA PERÍCIA',
  'FINALIZADO EM ACORDO ANTES DA PERÍCIA',
  'CERTIDÃO DE TRÂNSITO EM JULGADO',
  'SOLICITAÇÃO DE PAGAMENTO DE HONORÁRIOS',
  'HONORÁRIOS RECEBIDOS',
  'REFAZER A PERÍCIA - ORDEM JUDICIAL',
] as const;
