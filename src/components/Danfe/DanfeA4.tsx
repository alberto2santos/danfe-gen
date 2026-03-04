import {
  Document, Page, View, Text, Svg,
  Rect, Image,
  StyleSheet, Font,
  type Styles,
}  from '@react-pdf/renderer'
import type { NFeDados }        from '@/types/nfe.types'
import type { CompanyConfig }   from '@/types/company.types'
import {
  formatCurrency, formatNumber,  formatQuantity,
  formatDate,     formatDateTime, formatAccessKey,
  formatModalFrete, formatCRT,    formatAmbiente,
  formatTipoNFe,  formatFinalidade,
}                               from '@/utils/formatters'
import { encodeCode128C, calcBarcodeWidth } from '@/utils/code128'
import { buildQrMatrix }        from '@/utils/qrCodeSvg'
import {
  PAGE, CONTENT_W, FONT, ROW_H, COLOR, BORDER,
  PRODUCT_COLS, PRODUCT_DESC_W, PRODUCTS_PER_PAGE,
}                               from '@/utils/danfeLayout'

/* ─── Registro da fonte Inter ─────────────────────────────────── */
Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Inter-Bold.ttf',    fontWeight: 700 },
  ],
})

Font.registerHyphenationCallback(word => [word])

/* ─── StyleSheet ──────────────────────────────────────────────── */
const s = StyleSheet.create({

  page: {
    backgroundColor: COLOR.bg,
    paddingTop:      PAGE.marginTop,
    paddingRight:    PAGE.marginRight,
    paddingBottom:   PAGE.marginBottom,
    paddingLeft:     PAGE.marginLeft,
    fontFamily:      'Inter',
    fontSize:        FONT.value,
    color:           COLOR.value,
  },

  row:  { flexDirection: 'row' },
  col:  { flexDirection: 'column' },
  flex: { flex: 1 },

  cell: {
    borderTopWidth:    BORDER.thin,
    borderRightWidth:  BORDER.thin,
    borderBottomWidth: BORDER.thin,
    borderLeftWidth:   BORDER.thin,
    borderColor:       COLOR.border,
    borderStyle:       'solid',
    padding:           2,
  },

  cellNoTop:   { borderTopWidth:   0 },
  cellNoLeft:  { borderLeftWidth:  0 },
  cellNoRight: { borderRightWidth: 0 },

  label: {
    fontSize:     FONT.label,
    color:        COLOR.label,
    marginBottom: 1,
  },
  value: {
    fontSize:   FONT.value,
    color:      COLOR.value,
    fontWeight: 400,
  },
  valueBold: {
    fontSize:   FONT.value,
    color:      COLOR.value,
    fontWeight: 700,
  },
  title: {
    fontSize:   FONT.title,
    fontWeight: 700,
    color:      COLOR.value,
    textAlign:  'center',
  },

  sectionHeader: {
    backgroundColor:   COLOR.bgSection,
    paddingVertical:   2,
    paddingHorizontal: 3,
    borderTopWidth:    BORDER.thin,
    borderRightWidth:  BORDER.thin,
    borderBottomWidth: BORDER.thin,
    borderLeftWidth:   BORDER.thin,
    borderColor:       COLOR.border,
    borderStyle:       'solid',
  },
  sectionHeaderText: {
    fontSize:      FONT.label,
    fontWeight:    700,
    color:         COLOR.value,
    textTransform: 'uppercase',
  },

  tableHeader: {
    backgroundColor:   COLOR.bgSection,
    flexDirection:     'row',
    borderTopWidth:    0,
    borderRightWidth:  BORDER.thin,
    borderBottomWidth: BORDER.thin,
    borderLeftWidth:   BORDER.thin,
    borderColor:       COLOR.border,
    borderStyle:       'solid',
  },
  tableCell: {
    fontSize:          FONT.label,
    paddingVertical:   2,
    paddingHorizontal: 2,
    borderRightWidth:  BORDER.thin,
    borderColor:       COLOR.border,
    borderStyle:       'solid',
  },
  tableRow: {
    flexDirection:     'row',
    borderTopWidth:    0,
    borderRightWidth:  BORDER.thin,
    borderBottomWidth: BORDER.thin,
    borderLeftWidth:   BORDER.thin,
    borderColor:       COLOR.border,
    borderStyle:       'solid',
  },
  tableRowAlt: {
    backgroundColor: '#f8f8f8',
  },

  chaveBox: {
    borderTopWidth:    0,
    borderRightWidth:  BORDER.thin,
    borderBottomWidth: BORDER.thin,
    borderLeftWidth:   BORDER.thin,
    borderColor:       COLOR.border,
    borderStyle:       'solid',
    padding:           3,
    marginTop:         0,
    alignItems:        'center',
  },

  watermark: {
    position:   'absolute',
    top:        '40%',
    left:       0,
    right:      0,
    textAlign:  'center',
    fontSize:   48,
    color:      'rgba(200,0,0,0.08)',
    fontWeight: 700,
  },
})

/* ============================================================
   Sub-componentes
   ============================================================ */

interface CellProps {
  label:   string
  value:   string | number | undefined | null
  width?:  number | string
  flex?:   number
  style?:  Styles[string]
  bold?:   boolean
  noLeft?: boolean
  noTop?:  boolean
}

function Cell({ label, value, width, flex, style, bold, noLeft, noTop }: CellProps) {
  const val = value !== undefined && value !== null ? String(value) : '—'
  return (
    <View style={[
      s.cell,
      noLeft ? s.cellNoLeft : {},
      noTop  ? s.cellNoTop  : {},
      width !== undefined ? { width } : {},
      flex  !== undefined ? { flex  } : {},
      ...(style ? [style] : []),   // ← spread condicional evita {} vazio
    ]}>
      <Text style={s.label}>{label}</Text>
      <Text style={bold ? s.valueBold : s.value}>{val}</Text>
    </View>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionHeaderText}>{title}</Text>
    </View>
  )
}

/* ─── Code 128 SVG ────────────────────────────────────────────── */
function Barcode128({ digits, height = 24 }: { digits: string; height?: number }) {
  const bars   = encodeCode128C(digits)
  const totalW = calcBarcodeWidth(bars)
  const scale  = CONTENT_W / totalW
  let   x      = 0

  return (
    <View style={{ alignItems: 'center', marginTop: 3 }}>
      <Svg width={CONTENT_W} height={height}>
        {bars.map((bar, i) => {
          const bx = x
          x += bar.width * scale
          return bar.black ? (
            <Rect
              key={i}
              x={bx} y={0}
              width={bar.width * scale}
              height={height}
              fill={COLOR.black}
            />
          ) : null
        })}
      </Svg>
      <Text style={{ fontSize: FONT.barcode, marginTop: 2, letterSpacing: 1.5 }}>
        {formatAccessKey(digits)}
      </Text>
    </View>
  )
}

/* ─── QR Code SVG ─────────────────────────────────────────────── */
function QrCode({ data, size = 56 }: { data: string; size?: number }) {
  const qr = buildQrMatrix(data)
  if (!qr) return null
  const { modules, size: qrSize } = qr
  const cellSize = size / qrSize
  return (
    <Svg width={size} height={size}>
      {modules.map((row, r) =>
        row.map((black, c) =>
          black ? (
            <Rect
              key={`${r}-${c}`}
              x={c * cellSize} y={r * cellSize}
              width={cellSize}  height={cellSize}
              fill={COLOR.black}
            />
          ) : null
        )
      )}
    </Svg>
  )
}

/* ─── Tabela de produtos ──────────────────────────────────────── */
function ProdutosTable({
  nfe, startIdx, endIdx, showHeader,
}: {
  nfe: NFeDados; startIdx: number; endIdx: number; showHeader: boolean
}) {
  const chunk = nfe.produtos.slice(startIdx, endIdx)
  return (
    <View>
      <SectionHeader title="Dados dos Produtos / Serviços" />
      {showHeader && (
        <View style={s.tableHeader}>
          {([
            { label: 'Cód.',      w: PRODUCT_COLS.code  },
            { label: 'Descrição', w: PRODUCT_DESC_W     },
            { label: 'NCM/SH',   w: PRODUCT_COLS.ncm   },
            { label: 'CST',      w: PRODUCT_COLS.cst   },
            { label: 'CFOP',     w: PRODUCT_COLS.cfop  },
            { label: 'Un.',      w: PRODUCT_COLS.unit  },
            { label: 'Qtd.',     w: PRODUCT_COLS.qty   },
            { label: 'Vl.Unit.', w: PRODUCT_COLS.vUnit },
            { label: 'Vl.Total', w: PRODUCT_COLS.vTotal },
          ] as const).map((col, i) => (
            <Text
              key={i}
              style={[
                s.tableCell,
                { width: col.w, fontWeight: 700, fontSize: FONT.label },
                i === 8 ? { borderRightWidth: 0 } : {},
              ]}
            >
              {col.label}
            </Text>
          ))}
        </View>
      )}
      {chunk.map((p, i) => (
        <View
          key={p.nItem}
          style={[s.tableRow, (startIdx + i) % 2 === 1 ? s.tableRowAlt : {}]}
          wrap={false}
        >
          <Text style={[s.tableCell, { width: PRODUCT_COLS.code,   fontSize: FONT.small }]}>{p.cProd}</Text>
          {/* ↓ numberOfLines não existe no react-pdf — usa maxLines ou remove */}
          <Text style={[s.tableCell, { width: PRODUCT_DESC_W,      fontSize: FONT.small }]}>{p.xProd}</Text>
          <Text style={[s.tableCell, { width: PRODUCT_COLS.ncm,    fontSize: FONT.small, textAlign: 'center' }]}>{p.NCM}</Text>
          <Text style={[s.tableCell, { width: PRODUCT_COLS.cst,    fontSize: FONT.small, textAlign: 'center' }]}>{p.CST ?? p.CSOSN ?? '—'}</Text>
          <Text style={[s.tableCell, { width: PRODUCT_COLS.cfop,   fontSize: FONT.small, textAlign: 'center' }]}>{p.CFOP}</Text>
          <Text style={[s.tableCell, { width: PRODUCT_COLS.unit,   fontSize: FONT.small, textAlign: 'center' }]}>{p.uCom}</Text>
          <Text style={[s.tableCell, { width: PRODUCT_COLS.qty,    fontSize: FONT.small, textAlign: 'right'  }]}>{formatQuantity(p.qCom)}</Text>
          <Text style={[s.tableCell, { width: PRODUCT_COLS.vUnit,  fontSize: FONT.small, textAlign: 'right'  }]}>{formatNumber(p.vUnCom)}</Text>
          <Text style={[s.tableCell, { width: PRODUCT_COLS.vTotal, fontSize: FONT.small, textAlign: 'right', borderRightWidth: 0, fontWeight: 700 }]}>{formatCurrency(p.vProd)}</Text>
        </View>
      ))}
    </View>
  )
}

/* ─── Totais ──────────────────────────────────────────────────── */
function TotaisBlock({ nfe }: { nfe: NFeDados }) {
  const t = nfe.totais
  const rows = [
    { label: 'Valor dos Produtos', value: formatCurrency(t.vProd)        },
    { label: 'Valor do Frete',     value: formatCurrency(t.vFrete ?? 0)  },
    { label: 'Valor do Seguro',    value: formatCurrency(t.vSeg   ?? 0)  },
    { label: 'Desconto',           value: formatCurrency(t.vDesc  ?? 0)  },
    { label: 'Outras Despesas',    value: '—'                            },
    { label: 'Valor do IPI',       value: formatCurrency(t.vIPI   ?? 0)  },
    { label: 'BC do ICMS',         value: formatCurrency(t.vBC)          },
    { label: 'Valor do ICMS',      value: formatCurrency(t.vICMS)        },
    { label: 'PIS',                value: formatCurrency(t.vPIS)         },
    { label: 'COFINS',             value: formatCurrency(t.vCOFINS)      },
  ]
  return (
    <View>
      <SectionHeader title="Cálculo do Imposto" />
      <View style={s.row}>
        {rows.map((r, i) => (
          <Cell key={i} label={r.label} value={r.value} flex={1} noLeft={i > 0} noTop />
        ))}
      </View>
      <View style={{
        flexDirection:     'row',
        borderTopWidth:    0,
        borderRightWidth:  BORDER.thin,
        borderBottomWidth: BORDER.thin,
        borderLeftWidth:   BORDER.thin,
        borderColor:       COLOR.border,
        borderStyle:       'solid',
      }}>
        <View style={{ flex: 1 }} />
        <View style={{
          width:             100,
          borderTopWidth:    0,
          borderRightWidth:  0,
          borderBottomWidth: 0,
          borderLeftWidth:   BORDER.thin,
          borderColor:       COLOR.border,
          borderStyle:       'solid',
          padding:           2,
          alignItems:        'flex-end',
        }}>
          <Text style={s.label}>VALOR TOTAL DA NF-e</Text>
          <Text style={[s.valueBold, { fontSize: 9 }]}>{formatCurrency(t.vNF)}</Text>
        </View>
      </View>
    </View>
  )
}

/* ─── Transporte ──────────────────────────────────────────────── */
function TransporteBlock({ nfe }: { nfe: NFeDados }) {
  const tr = nfe.transporte

  if (!tr) {
    return (
      <View>
        <SectionHeader title="Transportador / Volumes Transportados" />
        <View style={s.row}>
          <Cell label="Frete por Conta" value="Sem transporte informado" flex={1} noTop />
        </View>
      </View>
    )
  }

  return (
    <View>
      <SectionHeader title="Transportador / Volumes Transportados" />
      <View style={s.row}>
        <Cell label="Razão Social"     value={tr.xNome}                      flex={3}           />
        <Cell label="Frete por Conta"  value={formatModalFrete(tr.modFrete)} flex={2} noLeft    />
        <Cell label="Código ANTT"      value="—"                             flex={1} noLeft    />
        <Cell label="Placa do Veículo" value={tr.placa ?? '—'}               flex={1} noLeft    />
        <Cell label="UF"               value={tr.UF}                         width={20} noLeft  />
        <Cell label="CNPJ / CPF"       value={tr.CNPJ}                       flex={2} noLeft    />
      </View>
      <View style={s.row}>
        <Cell label="Endereço"   value={tr.xEnder}  flex={3} noTop                              />
        <Cell label="Município"  value={tr.xMun}    flex={2} noLeft noTop                       />
        <Cell label="UF"         value={tr.UF}      width={20} noLeft noTop                     />
        <Cell label="IE"         value={tr.IE}      flex={1} noLeft noTop                       />
        <Cell label="Qtde"       value={tr.qVol}    flex={1} noLeft noTop                       />
        <Cell label="Espécie"    value={tr.esp}     flex={1} noLeft noTop                       />
        <Cell label="Marca"      value={tr.marca ?? '—'} flex={1} noLeft noTop                 />
        <Cell label="Numeração"  value="—"          flex={1} noLeft noTop                       />
        <Cell label="Peso Bruto" value={tr.pesoB ? formatNumber(tr.pesoB, 3) : '—'} flex={1} noLeft noTop />
        <Cell label="Peso Líq."  value={tr.pesoL ? formatNumber(tr.pesoL, 3) : '—'} flex={1} noLeft noTop />
      </View>
    </View>
  )
}

/* ─── Informações adicionais ──────────────────────────────────── */
function InfAdicBlock({ nfe }: { nfe: NFeDados }) {
  if (!nfe.infCpl && !nfe.infAdFisco) return null
  return (
    <View>
      <SectionHeader title="Dados Adicionais" />
      <View style={s.row}>
        <View style={[s.cell, { flex: 3, minHeight: 40 }]}>
          <Text style={s.label}>Informações Complementares</Text>
          <Text style={[s.value, { flexWrap: 'wrap' }]}>{nfe.infCpl ?? '—'}</Text>
        </View>
        <View style={[s.cell, s.cellNoLeft, { flex: 1, minHeight: 40 }]}>
          <Text style={s.label}>Reservado ao Fisco</Text>
          <Text style={[s.value, { flexWrap: 'wrap' }]}>{nfe.infAdFisco ?? '—'}</Text>
        </View>
      </View>
    </View>
  )
}

/* ─── Cabeçalho ───────────────────────────────────────────────── */
function DanfeHeader({
  nfe, config, pageNumber, totalPages,
}: {
  nfe: NFeDados; config: CompanyConfig; pageNumber: number; totalPages: number
}) {
  const e = nfe.emitente
  return (
    <View>
      <View style={{
        flexDirection:     'row',
        borderTopWidth:    BORDER.thin,
        borderRightWidth:  BORDER.thin,
        borderBottomWidth: BORDER.thin,
        borderLeftWidth:   BORDER.thin,
        borderColor:       COLOR.border,
        borderStyle:       'solid',
      }}>
        <View style={{ width: 140, padding: 4, justifyContent: 'center', alignItems: 'center' }}>
          {config.showLogo && config.logoUrl ? (
            <Image src={config.logoUrl} style={{ maxWidth: 120, maxHeight: 40, objectFit: 'contain' }} />
          ) : (
            <View>
              <Text style={[s.valueBold, { fontSize: 8, textAlign: 'center' }]}>{e.xNome}</Text>
              {e.xFant && <Text style={[s.value, { fontSize: 7, textAlign: 'center' }]}>{e.xFant}</Text>}
            </View>
          )}
        </View>

        <View style={{
          flex:              1,
          borderLeftWidth:   BORDER.thin,
          borderRightWidth:  BORDER.thin,
          borderTopWidth:    0,
          borderBottomWidth: 0,
          borderColor:       COLOR.border,
          borderStyle:       'solid',
          padding:           4,
          alignItems:        'center',
          justifyContent:    'center',
          gap:               2,
        }}>
          <Text style={[s.title, { fontSize: 10 }]}>DANFE</Text>
          <Text style={[s.value, { textAlign: 'center', fontSize: 6 }]}>
            Documento Auxiliar da Nota Fiscal Eletrônica
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 3 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={s.label}>Entrada</Text>
              <Text style={s.value}>0</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={s.label}>Saída</Text>
              <Text style={s.value}>1</Text>
            </View>
          </View>
          <View style={{
            borderTopWidth:    BORDER.thin,
            borderRightWidth:  BORDER.thin,
            borderBottomWidth: BORDER.thin,
            borderLeftWidth:   BORDER.thin,
            borderColor:       COLOR.border,
            borderStyle:       'solid',
            paddingHorizontal: 8,
            paddingVertical:   2,
            marginTop:         2,
          }}>
            <Text style={[s.valueBold, { fontSize: 8 }]}>
              {nfe.tpNF === '0' ? '0' : '1'}
            </Text>
          </View>
        </View>

        <View style={{ width: 110, padding: 4, justifyContent: 'center', gap: 4 }}>
          <View>
            <Text style={s.label}>Nº</Text>
            <Text style={s.valueBold}>{String(nfe.nNF).padStart(9, '0')}</Text>
          </View>
          <View>
            <Text style={s.label}>Série</Text>
            <Text style={s.value}>{nfe.serie}</Text>
          </View>
          <View>
            <Text style={s.label}>Folha</Text>
            <Text style={s.value}>{pageNumber} / {totalPages}</Text>
          </View>
        </View>
      </View>

      <View style={{
        flexDirection:     'row',
        borderTopWidth:    0,
        borderRightWidth:  BORDER.thin,
        borderBottomWidth: BORDER.thin,
        borderLeftWidth:   BORDER.thin,
        borderColor:       COLOR.border,
        borderStyle:       'solid',
      }}>
        <View style={{ flex: 1, padding: 3 }}>
          <Text style={s.label}>Emitente</Text>
          <Text style={s.valueBold}>{e.xNome}</Text>
          <Text style={s.value}>{e.xLgr}, {e.nro} — {e.xBairro} — {e.xMun}/{e.UF} — CEP: {e.CEP}</Text>
          {e.fone && <Text style={s.value}>Fone: {e.fone}</Text>}
        </View>
        <View style={{
          width:             120,
          borderTopWidth:    0,
          borderRightWidth:  0,
          borderBottomWidth: 0,
          borderLeftWidth:   BORDER.thin,
          borderColor:       COLOR.border,
          borderStyle:       'solid',
          padding:           3,
          gap:               3,
        }}>
          <Cell label="CNPJ" value={e.CNPJ}           />
          <Cell label="IE"   value={e.IE}   noTop     />
          <Cell label="CRT"  value={formatCRT(e.CRT)} noTop />
        </View>
      </View>

      <View style={{
        flexDirection:     'row',
        borderTopWidth:    0,
        borderRightWidth:  BORDER.thin,
        borderBottomWidth: BORDER.thin,
        borderLeftWidth:   BORDER.thin,
        borderColor:       COLOR.border,
        borderStyle:       'solid',
      }}>
        <Cell label="Natureza da Operação"     value={nfe.natOp}                 flex={2}          />
        <Cell label="Protocolo de Autorização" value="(ver SEFAZ)"               flex={2} noLeft   />
        <Cell label="Data e Hora de Emissão"   value={formatDateTime(nfe.dhEmi)} width={90} noLeft />
      </View>

      <View style={s.chaveBox}>
        <Text style={s.label}>Chave de Acesso</Text>
        <Barcode128 digits={nfe.chNFe} height={ROW_H.barcode - 16} />
      </View>

      {nfe.tpAmb === '2' && (
        <View style={{
          borderTopWidth:    0,
          borderRightWidth:  BORDER.thin,
          borderBottomWidth: BORDER.thin,
          borderLeftWidth:   BORDER.thin,
          borderColor:       '#cc0000',
          borderStyle:       'solid',
          backgroundColor:   '#fff0f0',
          padding:           3,
          alignItems:        'center',
        }}>
          <Text style={[s.valueBold, { color: '#cc0000', fontSize: 7 }]}>
            SEM VALOR FISCAL — AMBIENTE DE HOMOLOGAÇÃO
          </Text>
        </View>
      )}
    </View>
  )
}

/* ─── Destinatário ────────────────────────────────────────────── */
function DestinatarioBlock({ nfe }: { nfe: NFeDados }) {
  const d = nfe.destinatario
  return (
    <View style={{ marginTop: 2 }}>
      <SectionHeader title="Destinatário / Remetente" />
      <View style={s.row}>
        <Cell label="Nome / Razão Social"   value={d.xNome}                                        flex={3}          />
        <Cell label="CNPJ / CPF"            value={d.CNPJ ?? d.CPF}                                flex={2} noLeft   />
        <Cell label="Data de Saída/Entrada" value={nfe.dhSaiEnt ? formatDate(nfe.dhSaiEnt) : '—'}  width={70} noLeft />
      </View>
      <View style={s.row}>
        <Cell label="Endereço"   value={`${d.xLgr}, ${d.nro} — ${d.xBairro}`} flex={3} noTop        />
        <Cell label="Município"  value={d.xMun}  flex={2} noLeft noTop                              />
        <Cell label="UF"         value={d.UF}    width={20} noLeft noTop                            />
        <Cell label="CEP"        value={d.CEP}   flex={1} noLeft noTop                              />
        <Cell label="Fone / Fax" value={d.fone}  flex={1} noLeft noTop                              />
      </View>
    </View>
  )
}

/* ─── Rodapé ──────────────────────────────────────────────────── */
function DanfeFooter({ nfe }: { nfe: NFeDados & { qrCode?: string } }) {
  const hasQR = !!(nfe as unknown as { qrCode?: string }).qrCode

  // ── casts para satisfazer os tipos das funções de formatação ──
  const tpAmb   = (nfe.tpAmb  ?? '1') as '1' | '2'
  const tpNF    = (nfe.tpNF   ?? '1') as '0' | '1'
  const finNFe  =  nfe.finNFe ?? '1'

  return (
    <View style={{
      marginTop:         4,
      borderTopWidth:    BORDER.thin,
      borderRightWidth:  BORDER.thin,
      borderBottomWidth: BORDER.thin,
      borderLeftWidth:   BORDER.thin,
      borderColor:       COLOR.border,
      borderStyle:       'solid',
      flexDirection:     'row',
      alignItems:        'center',
      padding:           4,
      gap:               8,
    }}>
      {hasQR && (
        <View style={{ alignItems: 'center', gap: 2 }}>
          <QrCode data={(nfe as unknown as { qrCode: string }).qrCode} size={56} />
          <Text style={[s.label, { fontSize: 5, textAlign: 'center' }]}>
            Consulta via QR Code
          </Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={[s.label, { fontSize: 5 }]}>
          Consulta de autenticidade no portal nacional da NF-e:
        </Text>
        <Text style={[s.value, { fontSize: 5 }]}>
          www.nfe.fazenda.gov.br/portal ou nos sites das UFs
        </Text>
        <Text style={[s.label, { fontSize: 5, marginTop: 3 }]}>Chave de Acesso:</Text>
        <Text style={[s.value, { fontSize: 6, letterSpacing: 0.5 }]}>
          {formatAccessKey(nfe.chNFe)}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <Text style={s.label}>Tipo</Text>
        <Text style={s.value}>{formatTipoNFe(tpNF)}</Text>
        <Text style={[s.label, { marginTop: 3 }]}>Finalidade</Text>
        <Text style={s.value}>{formatFinalidade(finNFe)}</Text>
        <Text style={[s.label, { marginTop: 3 }]}>Ambiente</Text>
        <Text style={[s.value, tpAmb === '2' ? { color: '#cc0000' } : {}]}>
          {formatAmbiente(tpAmb)}
        </Text>
      </View>
    </View>
  )
}

/* ============================================================
   Documento principal
   ============================================================ */
interface DanfeA4Props {
  nfe:    NFeDados
  config: CompanyConfig
}

export function DanfeA4({ nfe, config }: DanfeA4Props) {
  const chunks: { start: number; end: number }[] = []
  let i = 0
  while (i < nfe.produtos.length) {
    chunks.push({ start: i, end: i + PRODUCTS_PER_PAGE })
    i += PRODUCTS_PER_PAGE
  }
  if (chunks.length === 0) chunks.push({ start: 0, end: 0 })
  const totalPages = chunks.length

  return (
    <Document
      title={`DANFE NF-e ${String(nfe.nNF).padStart(9,'0')}-${nfe.serie}`}
      author={config.name || nfe.emitente.xNome}
      creator="DanfeGen"
      producer="DanfeGen — @react-pdf/renderer"
      subject="Documento Auxiliar da Nota Fiscal Eletrônica"
      language="pt-BR"
    >
      {chunks.map((chunk, pageIdx) => (
        <Page key={pageIdx} size="A4" style={s.page} wrap>

          {(config.showWatermark || nfe.tpAmb === '2') && (
            <Text style={s.watermark} fixed>SEM VALOR FISCAL</Text>
          )}

          <DanfeHeader
            nfe={nfe} config={config}
            pageNumber={pageIdx + 1} totalPages={totalPages}
          />

          {pageIdx === 0 && <DestinatarioBlock nfe={nfe} />}

          <ProdutosTable
            nfe={nfe}
            startIdx={chunk.start}
            endIdx={chunk.end}
            showHeader
          />

          {pageIdx === totalPages - 1 && (
            <>
              <TotaisBlock     nfe={nfe} />
              <TransporteBlock nfe={nfe} />
              <InfAdicBlock    nfe={nfe} />
              <DanfeFooter     nfe={nfe as NFeDados & { qrCode?: string }} />
            </>
          )}

        </Page>
      ))}
    </Document>
  )
}