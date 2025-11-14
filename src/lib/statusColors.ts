// Status color mapping based on the provided image
export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'FINALIZADO EM ACORDO ANTES DA PERÍCIA': 'bg-red-600 text-white',
    'REFAZER A PERÍCIA - ORDEM JUDICIAL': 'bg-red-600 text-white',
    'AGENDAR PERÍCIA': 'bg-yellow-300 text-black',
    'AGUARDANDO PERÍCIA': 'bg-yellow-300 text-black',
    'AGUARDANDO LAUDO': 'bg-yellow-300 text-black',
    'AGUARDANDO ESCLARECIMENTOS': 'bg-blue-400 text-white',
    'LAUDO/ESCLARECIMENTOS ENTREGUES': 'bg-blue-400 text-white',
    'SENTENÇA': 'bg-blue-400 text-white',
    'ACORDO APÓS REALIZAÇÃO DA PERÍCIA': 'bg-orange-400 text-black',
    'CERTIDÃO DE TRÂNSITO EM JULGADO': 'bg-gray-300 text-black',
    'SOLICITAÇÃO DE PAGAMENTO DE HONORÁRIOS': 'bg-purple-400 text-white',
    'HONORÁRIOS RECEBIDOS': 'bg-green-400 text-black',
    'RECURSO ORDINÁRIO': 'bg-white text-black border-2 border-gray-800',
    // Old statuses (fallback)
    'Aguardando': 'bg-yellow-300 text-black',
    'Em andamento': 'bg-blue-400 text-white',
    'Suspensa': 'bg-orange-400 text-black',
    'Concluída': 'bg-green-400 text-black',
    'Arquivada': 'bg-gray-300 text-black',
  };
  
  return colorMap[status] || 'bg-muted text-muted-foreground';
};

export const STATUS_OPTIONS = [
  'AGUARDANDO PERÍCIA',
  'AGENDAR PERÍCIA',
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
