import { useRef }              from 'react'
import type { NFeDados }       from '@/types/nfe.types'
import type { CompanyConfig }  from '@/types/company.types'
import                              './DanfeThermal.css'
import {
  formatCurrency,
  formatDateTime,
  formatAccessKey,
  formatModalFrete,
  formatQuantity,
  formatNumber,
}                              from '@/utils/formatters'
import { encodeCode128C, calcBarcodeWidth, type Bar } from '@/utils/code128'

/* ─── Props ───────────────────────────────────────────────────── */
interface DanfeThermalProps {
  nfe:    NFeDados
  config: CompanyConfig
}

/* ─── Code 128 SVG inline ─────────────────────────────────────── */
function BarcodeHtml({ digits }: { digits: string }) {
  const bars       = encodeCode128C(digits)
  const totalUnits = calcBarcodeWidth(bars)
  const svgW       = 288
  const svgH       = 40
  const scale      = svgW / totalUnits

  let x = 0
  const rects: React.ReactNode[] = []

  bars.forEach((bar: Bar, i: number) => {
    const bx = x
    x += bar.width * scale
    if (bar.black) {
      rects.push(
        <rect
          key={i}
          x={bx}
          y={0}
          width={bar.width * scale}
          height={svgH}
          fill="#000000"
        />
      )
    }
  })

  return (
    <div className="thermal-barcode">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        aria-label={`Código de barras: ${formatAccessKey(digits)}`}
        role="img"
      >
        {rects}
      </svg>
      <p className="thermal-barcode-digits">
        {formatAccessKey(digits)}
      </p>
    </div>
  )
}

/* ─── Linha de campo ──────────────────────────────────────────── */
interface ThermalFieldProps {
  label: string
  value: string | number | undefined | null
  bold?: boolean
  mono?: boolean
}

function ThermalField({ label, value, bold, mono }: ThermalFieldProps) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="thermal-field">
      <span className="thermal-label">{label}:</span>
      <span className={[
        'thermal-value',
        bold ? 'thermal-bold' : '',
        mono ? 'thermal-mono' : '',
      ].filter(Boolean).join(' ')}>
        {String(value)}
      </span>
    </div>
  )
}

/* ─── Separador ───────────────────────────────────────────────── */
function Divider({ dashed = false }: { dashed?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={dashed ? 'thermal-divider-dashed' : 'thermal-divider'}
    />
  )
}

/* ─── Componente principal ────────────────────────────────────── */
export function DanfeThermal({ nfe, config }: DanfeThermalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const e  = nfe.emitente
  const d  = nfe.destinatario
  const t  = nfe.totais
  const tr = nfe.transporte   // ← pode ser undefined — guards abaixo

  return (
    <>

      <div id="thermal-print-root">
        <div ref={containerRef} className="thermal-wrapper" role="document" aria-label="Etiqueta DANFE Térmica 80mm">

          {/* ─── Cabeçalho da empresa ──────────────────────── */}
          <div className="thermal-header">
            {config.showLogo && config.logoUrl && (
              <img src={config.logoUrl} alt={config.name || e.xNome} className="thermal-logo" />
            )}
            <span className="thermal-company-name">{config.name || e.xNome}</span>
            <span className="thermal-company-cnpj">CNPJ: {config.cnpj || e.CNPJ}</span>
            <span className="thermal-company-address">
              {config.address || `${e.xLgr}, ${e.nro} — ${e.xMun}/${e.UF}`}
            </span>
          </div>

          {/* ─── Título DANFE ──────────────────────────────── */}
          <div className="thermal-title">
            DANFE SIMPLIFICADO
            <span className="thermal-subtitle">Documento Auxiliar da NF-e</span>
          </div>

          {/* ─── Alerta homologação ────────────────────────── */}
          {nfe.tpAmb === '2' && (
            <div className="thermal-watermark" role="alert">
              SEM VALOR FISCAL — HOMOLOGAÇÃO
            </div>
          )}

          {/* ─── Identificação ─────────────────────────────── */}
          <div className="thermal-section-title">Identificação</div>
          <ThermalField label="NF-e Nº" value={String(nfe.nNF).padStart(9,'0')} bold mono />
          <ThermalField label="Série"   value={nfe.serie}                        mono />
          <ThermalField label="Emissão" value={formatDateTime(nfe.dhEmi)}             />
          {nfe.dhSaiEnt && (
            <ThermalField label="Saída" value={formatDateTime(nfe.dhSaiEnt)} />
          )}
          <ThermalField label="Nat. Op." value={nfe.natOp}                           />
          <ThermalField label="CFOP"     value={nfe.produtos[0]?.CFOP ?? '—'} mono  />

          <Divider dashed />

          {/* ─── Emitente ──────────────────────────────────── */}
          <div className="thermal-section-title">Emitente / Remetente</div>
          <ThermalField label="Nome"  value={e.xNome}                                bold />
          <ThermalField label="CNPJ"  value={e.CNPJ}                                 mono />
          <ThermalField label="IE"    value={e.IE}                                   mono />
          <ThermalField label="End."  value={`${e.xLgr}, ${e.nro} — ${e.xBairro}`}       />
          <ThermalField label="Cidade" value={`${e.xMun}/${e.UF} — CEP: ${e.CEP}`}       />
          {e.fone && <ThermalField label="Fone" value={e.fone} />}

          <Divider dashed />

          {/* ─── Destinatário ──────────────────────────────── */}
          <div className="thermal-section-title">Destinatário / Remetente</div>
          <ThermalField label="Nome"  value={d.xNome}                                bold />
          {d.CNPJ  && <ThermalField label="CNPJ"   value={d.CNPJ}  mono />}
          {d.CPF   && <ThermalField label="CPF"    value={d.CPF}   mono />}
          <ThermalField label="End."  value={`${d.xLgr}, ${d.nro} — ${d.xBairro}`}       />
          <ThermalField label="Cidade" value={`${d.xMun}/${d.UF} — CEP: ${d.CEP}`}       />
          {d.fone  && <ThermalField label="Fone"   value={d.fone}  />}
          {d.email && <ThermalField label="E-mail" value={d.email} />}

          <Divider dashed />

          {/* ─── Produtos ──────────────────────────────────── */}
          <div className="thermal-section-title">
            Produtos ({nfe.produtos.length} {nfe.produtos.length === 1 ? 'item' : 'itens'})
          </div>

          <table className="thermal-table" aria-label="Lista de produtos">
            <thead>
              <tr>
                <th>Descrição</th>
                <th className="col-num">Qtd</th>
                <th className="col-num">Unit.</th>
                <th className="col-num">Total</th>
              </tr>
            </thead>
            <tbody>
              {nfe.produtos.map(p => (
                <tr key={p.nItem}>
                  <td className="col-desc">
                    <span style={{ fontWeight: 'bold', display: 'block', fontSize: '7px' }}>
                      {p.cProd}
                    </span>
                    {p.xProd}
                  </td>
                  <td className="col-num">{formatQuantity(p.qCom)} {p.uCom}</td>
                  <td className="col-num">{formatNumber(p.vUnCom)}</td>
                  <td className="col-num">{formatCurrency(p.vProd)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <Divider />

          {/* ─── Totais ────────────────────────────────────── */}
          <div className="thermal-totals" aria-label="Totais da nota fiscal">
            {t.vDesc !== undefined && t.vDesc > 0 && (
              <div className="thermal-total-line">
                <span>Desconto</span>
                <span>- {formatCurrency(t.vDesc)}</span>
              </div>
            )}

            {/* ✅ tr pode ser undefined — usa optional chaining */}
            {t.vFrete !== undefined && t.vFrete > 0 && (
              <div className="thermal-total-line">
                <span>Frete ({formatModalFrete(tr?.modFrete ?? '9')})</span>
                <span>{formatCurrency(t.vFrete)}</span>
              </div>
            )}

            {t.vIPI !== undefined && t.vIPI > 0 && (
              <div className="thermal-total-line">
                <span>IPI</span>
                <span>{formatCurrency(t.vIPI)}</span>
              </div>
            )}
            <div className="thermal-total-line">
              <span>ICMS (BC: {formatCurrency(t.vBC)})</span>
              <span>{formatCurrency(t.vICMS)}</span>
            </div>
            <div className="thermal-total-line">
              <span>PIS</span>
              <span>{formatCurrency(t.vPIS)}</span>
            </div>
            <div className="thermal-total-line">
              <span>COFINS</span>
              <span>{formatCurrency(t.vCOFINS)}</span>
            </div>
            <div className="thermal-total-line thermal-total-main">
              <span>VALOR TOTAL</span>
              <span>{formatCurrency(t.vNF)}</span>
            </div>
          </div>

          <Divider />

          {/* ─── Transporte ────────────────────────────────── */}
          {/* ✅ guard completo — tr undefined não entra no bloco */}
          {tr && tr.modFrete !== '9' && (
            <>
              <div className="thermal-section-title">Transporte</div>
              <ThermalField label="Frete" value={formatModalFrete(tr.modFrete)} />
              {tr.xNome && (
                <ThermalField label="Transportadora" value={tr.xNome} />
              )}
              {tr.qVol !== undefined && (
                <ThermalField
                  label="Volumes"
                  value={`${tr.qVol} vol(s)${tr.esp ? ` — ${tr.esp}` : ''}`}
                />
              )}
              {tr.pesoB !== undefined && (
                <ThermalField
                  label="Peso"
                  value={`${formatNumber(tr.pesoB, 3)} kg (bruto)`}
                />
              )}
              <Divider dashed />
            </>
          )}

          {/* ─── Informações adicionais ────────────────────── */}
          {nfe.infCpl && (
            <>
              <div className="thermal-section-title">Inf. Complementares</div>
              <p style={{ fontSize: '8px', lineHeight: '1.4', margin: '2px 0', wordBreak: 'break-word' }}>
                {nfe.infCpl}
              </p>
              <Divider dashed />
            </>
          )}

          {/* ─── Código de barras ──────────────────────────── */}
          <div className="thermal-section-title">Chave de Acesso</div>
          <BarcodeHtml digits={nfe.chNFe} />

          {/* ─── Rodapé ────────────────────────────────────── */}
          <Divider />
          <div className="thermal-footer">
            <p>Consulte em: www.nfe.fazenda.gov.br</p>
            <p>Emitido por DanfeGen</p>
            {config.email && <p>{config.email}</p>}
            {config.phone && <p>{config.phone}</p>}
          </div>

        </div>
      </div>
    </>
  )
}