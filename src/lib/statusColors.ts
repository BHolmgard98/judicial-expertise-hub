// Status color mapping based on the provided image
export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'FINALIZADO EM ACORDO ANTES DA PERÍCIA': 'bg-red-500 text-white',
    'REFAZER A PERÍCIA - ORDEM JUDICIAL': 'bg-red-500 text-white',
    'AGENDAR PERÍCIA': 'bg-yellow-400 text-black',
    'AGUARDANDO PERÍCIA': 'bg-yellow-400 text-black',
    'AGUARDANDO LAUDO': 'bg-yellow-400 text-black',
    'AGUARDANDO ESCLARECIMENTOS': 'bg-blue-500 text-white',
    'LAUDO/ESCLARECIMENTOS ENTREGUES': 'bg-blue-500 text-white',
    'SENTENÇA': 'bg-blue-500 text-white',
    'ACORDO APÓS REALIZAÇÃO DA PERÍCIA': 'bg-orange-500 text-white',
    'CERTIDÃO DE TRÂNSITO EM JULGADO': 'bg-gray-400 text-white',
    'SOLICITAÇÃO DE PAGAMENTO DE HONORÁRIOS': 'bg-purple-500 text-white',
    'HONORÁRIOS RECEBIDOS': 'bg-green-500 text-white',
    'RECURSO ORDINÁRIO': 'bg-white text-black border border-border',
    // Old statuses (fallback)
    'Aguardando': 'bg-yellow-400 text-black',
    'Em andamento': 'bg-blue-500 text-white',
    'Suspensa': 'bg-orange-500 text-white',
    'Concluída': 'bg-green-500 text-white',
    'Arquivada': 'bg-gray-400 text-white',
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
