/* ============================================================
   danfeLayout.ts — Constantes de layout DANFE A4 oficial SEFAZ
   Baseado no Manual de Orientação do Contribuinte NF-e 4.0
   e Anexo III — Manual de Especificações Técnicas do DANFE
   ============================================================ */

/* ─── Página A4 ───────────────────────────────────────────────── */
export const PAGE = {
  width:        595.28,   // pontos (210mm)
  height:       841.89,   // pontos (297mm)
  marginTop:    14.17,    // 5mm
  marginRight:  14.17,
  marginBottom: 14.17,
  marginLeft:   14.17,
} as const

/* ─── Largura útil ────────────────────────────────────────────── */
export const CONTENT_W = PAGE.width - PAGE.marginLeft - PAGE.marginRight
// = 566.94 pontos (~200mm)

/* ─── Tipografia ──────────────────────────────────────────────── */
export const FONT = {
  label:   6,    // rótulo de campo (DESTINATÁRIO / NOME etc)
  value:   7,    // valor de campo
  small:   6,    // campos muito estreitos
  barcode: 7,    // dígitos abaixo do code 128
  title:   8,    // título das seções (DANFE, NOTA FISCAL)
} as const

/* ─── Alturas de linha padrão ─────────────────────────────────── */
export const ROW_H = {
  header:  28,   // bloco de cabeçalho
  section: 18,   // linha de seção (emitente, destinatário etc)
  field:   14,   // campo simples
  product: 11,   // linha de produto na tabela
  barcode: 48,   // altura do code 128 + texto
} as const

/* ─── Cores monocromáticas — padrão SEFAZ ────────────────────── */
export const COLOR = {
  black:       '#000000',
  border:      '#000000',
  label:       '#4a4a4a',   // cinza escuro — rótulos
  value:       '#000000',   // preto — valores
  bg:          '#ffffff',   // branco — fundo
  bgSection:   '#f0f0f0',   // cinza claro — cabeçalhos de seção
  separator:   '#000000',   // preto — separadores
} as const

/* ─── Espessura de bordas ─────────────────────────────────────── */
export const BORDER = {
  thin:   0.5,
  normal: 0.75,
  thick:  1,
} as const

/* ─── Larguras das colunas da tabela de produtos ──────────────── */
export const PRODUCT_COLS = {
  item:    20,   // #
  code:    32,   // Cód. Produto
  desc:    0,    // Descrição — flex (preenche o restante)
  ncm:     30,   // NCM/SH
  cst:     18,   // CST
  cfop:    18,   // CFOP
  unit:    16,   // Un.
  qty:     26,   // Qtd.
  vUnit:   34,   // Vl. Unit.
  vTotal:  34,   // Vl. Total
} as const

// Largura fixa total (sem o desc flex)
export const PRODUCT_FIXED_W =
  PRODUCT_COLS.item  + PRODUCT_COLS.code  +
  PRODUCT_COLS.ncm   + PRODUCT_COLS.cst   +
  PRODUCT_COLS.cfop  + PRODUCT_COLS.unit  +
  PRODUCT_COLS.qty   + PRODUCT_COLS.vUnit +
  PRODUCT_COLS.vTotal

export const PRODUCT_DESC_W = CONTENT_W - PRODUCT_FIXED_W

/* ─── Quantos produtos cabem por página ───────────────────────── */
export const PRODUCTS_PER_PAGE = 22