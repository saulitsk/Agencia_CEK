/**
 * destinos-data.js
 * Cadastro único de destinos da Agência C&K.
 * Importado por main.js (home) e busca-destinos.js (página de destinos).
 */

// ============================================================
// WHATSAPP
// ============================================================
export const WHATSAPP_NUMERO = '5511954047211';

/**
 * Mensagem para destino cadastrado.
 * @param {string} destino - Nome do destino (ex: "Irecê")
 * @param {string} uf - Sigla do estado (ex: "BA")
 * @param {string} data - Data formatada ou "a definir"
 */
export const MENSAGEM_DESTINO_CADASTRADO = (destino, uf, data) =>
  `Olá! Gostaria de consultar uma passagem saindo de São Paulo para ${destino} — ${uf}. Data pretendida: ${data}.`;

/**
 * Mensagem para destino fora do cadastro.
 * @param {string} textoDigitado - Texto livre digitado pelo usuário
 * @param {string} data - Data formatada ou "a definir"
 */
export const MENSAGEM_DESTINO_LIVRE = (textoDigitado, data) =>
  `Olá! Gostaria de saber se vocês atendem o destino ${textoDigitado}, saindo de São Paulo. Data pretendida: ${data}.`;

// ============================================================
// NORMALIZAÇÃO (remove acentos, minúsculas)
// ============================================================
export function normalizar(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// ============================================================
// CADASTRO ÚNICO — 83 DESTINOS
// Cada objeto: { id, nome, uf, detalhe? }
// Ordenados alfabeticamente por nome dentro de cada UF.
// ============================================================
export const DESTINOS = [
  // --- BAHIA (68) ---
  { id: 'abaira', nome: 'Abaíra', uf: 'BA' },
  { id: 'america-dourada', nome: 'América Dourada', uf: 'BA' },
  { id: 'anage', nome: 'Anagé', uf: 'BA' },
  { id: 'andarai', nome: 'Andaraí', uf: 'BA' },
  { id: 'aracatu', nome: 'Aracatu', uf: 'BA' },
  { id: 'barra', nome: 'Barra', uf: 'BA' },
  { id: 'barra-da-estiva', nome: 'Barra da Estiva', uf: 'BA' },
  { id: 'barra-do-mendes', nome: 'Barra do Mendes', uf: 'BA' },
  { id: 'barreiras', nome: 'Barreiras', uf: 'BA' },
  { id: 'belo-campo', nome: 'Belo Campo', uf: 'BA' },
  { id: 'bom-jesus-da-lapa', nome: 'Bom Jesus da Lapa', uf: 'BA' },
  { id: 'boninal', nome: 'Boninal', uf: 'BA' },
  { id: 'bonito', nome: 'Bonito', uf: 'BA' },
  { id: 'boquira', nome: 'Boquira', uf: 'BA' },
  { id: 'botupora', nome: 'Botuporã', uf: 'BA' },
  { id: 'brumado', nome: 'Brumado', uf: 'BA' },
  { id: 'cacule', nome: 'Caculé', uf: 'BA' },
  { id: 'caetite', nome: 'Caetité', uf: 'BA' },
  { id: 'camamu', nome: 'Camamu', uf: 'BA' },
  { id: 'canarana', nome: 'Canarana', uf: 'BA' },
  { id: 'condeuba', nome: 'Condeúba', uf: 'BA' },
  { id: 'eunapolis', nome: 'Eunápolis', uf: 'BA' },
  { id: 'feira-de-santana', nome: 'Feira de Santana', uf: 'BA' },
  { id: 'guanambi', nome: 'Guanambi', uf: 'BA' },
  { id: 'ibiajara', nome: 'Ibiajara', uf: 'BA', detalhe: 'Distrito de Rio do Pires' },
  { id: 'ibiassuce', nome: 'Ibiassucê', uf: 'BA' },
  { id: 'ibipitanga', nome: 'Ibipitanga', uf: 'BA' },
  { id: 'ibitiara', nome: 'Ibitiara', uf: 'BA' },
  { id: 'ibotirama', nome: 'Ibotirama', uf: 'BA' },
  { id: 'ilheus', nome: 'Ilhéus', uf: 'BA' },
  { id: 'ipira', nome: 'Ipirá', uf: 'BA' },
  { id: 'ipupiara', nome: 'Ipupiara', uf: 'BA' },
  { id: 'iraquara', nome: 'Iraquara', uf: 'BA' },
  { id: 'irece', nome: 'Irecê', uf: 'BA' },
  { id: 'itaberaba', nome: 'Itaberaba', uf: 'BA' },
  { id: 'itabuna', nome: 'Itabuna', uf: 'BA' },
  { id: 'itapetinga', nome: 'Itapetinga', uf: 'BA' },
  { id: 'ituacu', nome: 'Ituaçu', uf: 'BA' },
  { id: 'jaguaquara', nome: 'Jaguaquara', uf: 'BA' },
  { id: 'jequie', nome: 'Jequié', uf: 'BA' },
  { id: 'joao-dourado', nome: 'João Dourado', uf: 'BA' },
  { id: 'lapao', nome: 'Lapão', uf: 'BA' },
  { id: 'lencois', nome: 'Lençóis', uf: 'BA' },
  { id: 'livramento-de-nossa-senhora', nome: 'Livramento de Nossa Senhora', uf: 'BA' },
  { id: 'luis-eduardo-magalhaes', nome: 'Luís Eduardo Magalhães', uf: 'BA' },
  { id: 'macaubas', nome: 'Macaúbas', uf: 'BA' },
  { id: 'milagres', nome: 'Milagres', uf: 'BA' },
  { id: 'morro-do-chapeu', nome: 'Morro do Chapéu', uf: 'BA' },
  { id: 'mulungu-do-morro', nome: 'Mulungu do Morro', uf: 'BA' },
  { id: 'paramirim', nome: 'Paramirim', uf: 'BA' },
  { id: 'piata', nome: 'Piatã', uf: 'BA' },
  { id: 'pocoes', nome: 'Poções', uf: 'BA' },
  { id: 'porto-seguro', nome: 'Porto Seguro', uf: 'BA' },
  { id: 'presidente-dutra', nome: 'Presidente Dutra', uf: 'BA' },
  { id: 'riacho-de-santana', nome: 'Riacho de Santana', uf: 'BA' },
  { id: 'rio-do-pires', nome: 'Rio do Pires', uf: 'BA' },
  { id: 'salobro', nome: 'Salobro', uf: 'BA' },
  { id: 'santa-maria-da-vitoria', nome: 'Santa Maria da Vitória', uf: 'BA' },
  { id: 'santana', nome: 'Santana', uf: 'BA' },
  { id: 'santo-estevao', nome: 'Santo Estêvão', uf: 'BA' },
  { id: 'seabra', nome: 'Seabra', uf: 'BA' },
  { id: 'souto-soares', nome: 'Souto Soares', uf: 'BA' },
  { id: 'tanhacu', nome: 'Tanhaçu', uf: 'BA' },
  { id: 'tanque-novo', nome: 'Tanque Novo', uf: 'BA' },
  { id: 'teixeira-de-freitas', nome: 'Teixeira de Freitas', uf: 'BA' },
  { id: 'tremedal', nome: 'Tremedal', uf: 'BA' },
  { id: 'valenca', nome: 'Valença', uf: 'BA' },
  { id: 'vitoria-da-conquista', nome: 'Vitória da Conquista', uf: 'BA' },

  // --- MINAS GERAIS (10) ---
  { id: 'araguari', nome: 'Araguari', uf: 'MG' },
  { id: 'caratinga', nome: 'Caratinga', uf: 'MG' },
  { id: 'governador-valadares', nome: 'Governador Valadares', uf: 'MG' },
  { id: 'manhuacu', nome: 'Manhuaçu', uf: 'MG' },
  { id: 'montes-claros', nome: 'Montes Claros', uf: 'MG' },
  { id: 'muriae', nome: 'Muriaé', uf: 'MG' },
  { id: 'realeza', nome: 'Realeza', uf: 'MG', detalhe: 'Distrito de Manhuaçu' },
  { id: 'teofilo-otoni', nome: 'Teófilo Otoni', uf: 'MG' },
  { id: 'uberaba', nome: 'Uberaba', uf: 'MG' },
  { id: 'uberlandia', nome: 'Uberlândia', uf: 'MG' },

  // --- GOIÁS (4) ---
  { id: 'catalao', nome: 'Catalão', uf: 'GO' },
  { id: 'cristalina', nome: 'Cristalina', uf: 'GO' },
  { id: 'formosa', nome: 'Formosa', uf: 'GO' },
  { id: 'luziania', nome: 'Luziânia', uf: 'GO' },

  // --- DISTRITO FEDERAL (1) ---
  { id: 'brasilia', nome: 'Brasília', uf: 'DF' },
];

// ============================================================
// BUSCA — correspondência parcial, sem acentos, case-insensitive
// ============================================================

/**
 * Busca destinos pelo termo digitado.
 * @param {string} termo - Texto digitado pelo usuário
 * @returns {Array} Destinos que correspondem ao termo
 */
export function buscarDestinos(termo) {
  const termoNorm = normalizar(termo.trim());
  if (termoNorm.length === 0) return [];

  return DESTINOS.filter(d => {
    const nomeNorm = normalizar(d.nome);
    if (nomeNorm.includes(termoNorm)) return true;
    // Também busca pelo detalhe (ex: "rio do pires" encontra Ibiajara)
    if (d.detalhe && normalizar(d.detalhe).includes(termoNorm)) return true;
    return false;
  });
}

/**
 * Agrupa destinos por UF, com BA primeiro.
 * @returns {Object} Ex: { BA: [...], MG: [...], GO: [...], DF: [...] }
 */
export function agruparPorUF() {
  const grupos = {};
  const ordemUF = ['BA', 'MG', 'GO', 'DF'];

  // Inicializa na ordem desejada
  ordemUF.forEach(uf => { grupos[uf] = []; });

  DESTINOS.forEach(d => {
    if (!grupos[d.uf]) grupos[d.uf] = [];
    grupos[d.uf].push(d);
  });

  return grupos;
}

// Nomes completos dos estados
export const NOMES_UF = {
  BA: 'Bahia',
  MG: 'Minas Gerais',
  GO: 'Goiás',
  DF: 'Distrito Federal',
};
