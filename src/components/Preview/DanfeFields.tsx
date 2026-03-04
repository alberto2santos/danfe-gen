import {
  formatCurrency,
  formatDateTime,
  formatAccessKey,
  formatModalFrete,
  formatCRT,
  formatTipoNFe,
  formatFinalidade,
  formatAmbiente,
  formatNumber,
  formatQuantity,
}                              from '@/utils/formatters'
import type { NFeDados }       from '@/types/nfe.types'

/* ─── Componente base de campo ────────────────────────────────── */
interface FieldProps {
  label:      string
  value:      string | number | undefined | null
  className?: string
  mono?:      boolean
}

function Field({ label, value, className = '', mono = false }: FieldProps) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <span className="text-[10px] font-medium uppercase tracking-wide text-surface-400 dark:text-surface-500">
        {label}
      </span>
      <span className={`text-sm text-surface-800 dark:text-surface-200 leading-snug ${mono ? 'font-mono tabular' : ''}`}>
        {String(value)}
      </span>
    </div>
  )
}

/* ─── Card de seção ───────────────────────────────────────────── */
interface SectionCardProps {
  title:      string
  icon:       React.ReactNode
  children:   React.ReactNode
  className?: string
}

function SectionCard({ title, icon, children, className = '' }: SectionCardProps) {
  return (
    <div className={`card p-4 md:p-5 space-y-3 ${className}`}>
      <div className="flex items-center gap-2 pb-2 border-b border-surface-100 dark:border-surface-800">
        <span className="text-brand-600 dark:text-brand-400" aria-hidden="true">
          {icon}
        </span>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400">
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}

/* ─── Ícones SVG inline ───────────────────────────────────────── */
const IconDoc = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 2h5l3 3v9H4V2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M9 2v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 7h4M6 9.5h4M6 12h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

const IconCompany = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="2" y="6" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M5 6V4a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="8" cy="10" r="1.2" fill="currentColor"/>
  </svg>
)

const IconPerson = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)

const IconBox = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2 5l6-3 6 3v6l-6 3-6-3V5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M8 2v12M2 5l6 3 6-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

const IconMoney = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="1" y="4" width="14" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M4 8h.01M12 8h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const IconTruck = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M1 3h9v7H1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M10 5h2.5L14 8v2h-4V5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <circle cx="3.5"  cy="11.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="11.5" cy="11.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
)

const IconInfo = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

/* ─── Identificação ───────────────────────────────────────────── */
export function IdentificacaoFields({ nfe }: { nfe: NFeDados }) {
  // ── casts para satisfazer os tipos literais das funções ───────
  const tpNF  = (nfe.tpNF  ?? '1') as '0' | '1'
  const tpAmb = (nfe.tpAmb ?? '1') as '1' | '2'
  const finNFe = nfe.finNFe ?? '1'

  return (
    <SectionCard title="Identificação" icon={IconDoc}>

      <div className="flex flex-col gap-1 p-3 rounded-lg bg-surface-50 dark:bg-surface-900 border border-surface-100 dark:border-surface-800">
        <span className="text-[10px] font-medium uppercase tracking-wide text-surface-400">
          Chave de Acesso
        </span>
        <span className="text-xs font-mono tabular break-all leading-relaxed text-surface-700 dark:text-surface-300">
          {formatAccessKey(nfe.chNFe)}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Field label="Número"  value={nfe.nNF}                   />
        <Field label="Série"   value={nfe.serie}                  />
        <Field label="Emissão" value={formatDateTime(nfe.dhEmi)}  />
        {nfe.dhSaiEnt && (
          <Field label="Saída/Entrada" value={formatDateTime(nfe.dhSaiEnt)} />
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Field label="Tipo"       value={formatTipoNFe(tpNF)}        />
        <Field label="Finalidade" value={formatFinalidade(finNFe)}   />
        <Field label="Ambiente"   value={formatAmbiente(tpAmb)}      />
        <Field
          label="Natureza da Operação"
          value={nfe.natOp}
          className="col-span-2 md:col-span-1"
        />
      </div>

      {tpAmb === '2' && (
        <div
          role="alert"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning-50 dark:bg-warning-950/30 border border-warning-200 dark:border-warning-800"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 text-warning-600">
            <path d="M8 2L1.5 13h13L8 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            <path d="M8 6v3.5M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-xs font-medium text-warning-700 dark:text-warning-400">
            NF-e de Homologação — Sem Valor Fiscal
          </span>
        </div>
      )}
    </SectionCard>
  )
}

/* ─── Emitente ────────────────────────────────────────────────── */
export function EmitenteFields({ nfe }: { nfe: NFeDados }) {
  const e = nfe.emitente
  return (
    <SectionCard title="Emitente" icon={IconCompany}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Razão Social"   value={e.xNome} className="md:col-span-2" />
        {e.xFant && (
          <Field label="Nome Fantasia" value={e.xFant} className="md:col-span-2" />
        )}
        <Field label="CNPJ"     value={e.CNPJ}           mono />
        <Field label="IE"       value={e.IE}             mono />
        <Field label="CRT"      value={formatCRT(e.CRT)}      />
        {e.fone && <Field label="Telefone" value={e.fone} />}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-surface-100 dark:border-surface-800">
        <Field
          label="Endereço"
          value={`${e.xLgr}, ${e.nro} — ${e.xBairro}`}
          className="md:col-span-2"
        />
        <Field label="Município / UF" value={`${e.xMun} / ${e.UF}`} />
        <Field label="CEP"            value={e.CEP}                  mono />
      </div>
    </SectionCard>
  )
}

/* ─── Destinatário ────────────────────────────────────────────── */
export function DestinatarioFields({ nfe }: { nfe: NFeDados }) {
  const d = nfe.destinatario
  return (
    <SectionCard title="Destinatário" icon={IconPerson}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Nome / Razão Social" value={d.xNome} className="md:col-span-2" />
        {d.CNPJ  && <Field label="CNPJ"    value={d.CNPJ}  mono />}
        {d.CPF   && <Field label="CPF"     value={d.CPF}   mono />}
        {d.fone  && <Field label="Telefone" value={d.fone}      />}
        {d.email && <Field label="E-mail"   value={d.email}     />}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-surface-100 dark:border-surface-800">
        <Field
          label="Endereço"
          value={`${d.xLgr}, ${d.nro} — ${d.xBairro}`}
          className="md:col-span-2"
        />
        <Field label="Município / UF" value={`${d.xMun} / ${d.UF}`} />
        <Field label="CEP"            value={d.CEP}                  mono />
      </div>
    </SectionCard>
  )
}

/* ─── Produtos ────────────────────────────────────────────────── */
export function ProdutosFields({ nfe }: { nfe: NFeDados }) {
  return (
    <SectionCard
      title={`Produtos (${nfe.produtos.length} ${nfe.produtos.length === 1 ? 'item' : 'itens'})`}
      icon={IconBox}
    >
      <div className="table-responsive -mx-1">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-surface-100 dark:border-surface-800">
              {['#','Código','Descrição','NCM','CFOP','Un','Qtd','Vl. Unit.','Vl. Total'].map(h => (
                <th
                  key={h}
                  scope="col"
                  className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wide text-surface-400 dark:text-surface-500 whitespace-nowrap text-left"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nfe.produtos.map((p, i) => (
              <tr
                key={p.nItem}
                className={`
                  border-b border-surface-50 dark:border-surface-900
                  hover:bg-surface-50 dark:hover:bg-surface-900
                  transition-colors duration-100
                  ${i % 2 === 0 ? '' : 'bg-surface-50/50 dark:bg-surface-900/30'}
                `}
              >
                <td className="px-2 py-2.5 text-surface-400 tabular">{p.nItem}</td>
                <td className="px-2 py-2.5 font-mono text-surface-600 dark:text-surface-400 whitespace-nowrap">{p.cProd}</td>
                <td className="px-2 py-2.5 text-surface-800 dark:text-surface-200 max-w-[200px]">
                  <span className="line-clamp-2" title={p.xProd}>{p.xProd}</span>
                </td>
                <td className="px-2 py-2.5 font-mono text-surface-500 whitespace-nowrap">{p.NCM}</td>
                <td className="px-2 py-2.5 font-mono text-surface-500 whitespace-nowrap">{p.CFOP}</td>
                <td className="px-2 py-2.5 text-surface-500 whitespace-nowrap">{p.uCom}</td>
                <td className="px-2 py-2.5 tabular text-right text-surface-700 dark:text-surface-300 whitespace-nowrap">{formatQuantity(p.qCom)}</td>
                <td className="px-2 py-2.5 tabular text-right text-surface-700 dark:text-surface-300 whitespace-nowrap">{formatCurrency(p.vUnCom)}</td>
                <td className="px-2 py-2.5 tabular text-right font-semibold text-surface-900 dark:text-surface-100 whitespace-nowrap">{formatCurrency(p.vProd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  )
}

/* ─── Totais ──────────────────────────────────────────────────── */
export function TotaisFields({ nfe }: { nfe: NFeDados }) {
  const t = nfe.totais
  return (
    <SectionCard title="Totais" icon={IconMoney}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Field label="Valor dos Produtos" value={formatCurrency(t.vProd)} />
        {t.vFrete !== undefined && t.vFrete > 0 && (
          <Field label="Frete"   value={formatCurrency(t.vFrete)} />
        )}
        {t.vSeg !== undefined && t.vSeg > 0 && (
          <Field label="Seguro"  value={formatCurrency(t.vSeg)} />
        )}
        {t.vDesc !== undefined && t.vDesc > 0 && (
          <Field label="Desconto" value={`- ${formatCurrency(t.vDesc)}`} />
        )}
        <Field label="BC ICMS"   value={formatCurrency(t.vBC)}     />
        <Field label="ICMS"      value={formatCurrency(t.vICMS)}   />
        {t.vIPI !== undefined && t.vIPI > 0 && (
          <Field label="IPI"     value={formatCurrency(t.vIPI)} />
        )}
        <Field label="PIS"       value={formatCurrency(t.vPIS)}    />
        <Field label="COFINS"    value={formatCurrency(t.vCOFINS)} />
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900 mt-2">
        <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">
          Total da NF-e
        </span>
        <span className="text-xl font-bold tabular text-brand-700 dark:text-brand-300">
          {formatCurrency(t.vNF)}
        </span>
      </div>
    </SectionCard>
  )
}

/* ─── Transporte ──────────────────────────────────────────────── */
export function TransporteFields({ nfe }: { nfe: NFeDados }) {
  const tr = nfe.transporte

  // ✅ guard — tr pode ser undefined
  if (!tr) {
    return (
      <SectionCard title="Transporte" icon={IconTruck}>
        <p className="text-sm text-surface-500 dark:text-surface-400">
          Sem informações de transporte.
        </p>
      </SectionCard>
    )
  }

  return (
    <SectionCard title="Transporte" icon={IconTruck}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Field
          label="Modalidade do Frete"
          value={formatModalFrete(tr.modFrete)}
          className="col-span-2 md:col-span-1"
        />
        {tr.xNome && <Field label="Transportadora"    value={tr.xNome}                           />}
        {tr.CNPJ  && <Field label="CNPJ"              value={tr.CNPJ}                    mono    />}
        {tr.IE    && <Field label="IE"                value={tr.IE}                              />}
        {tr.xMun  && (
          <Field label="Município / UF" value={`${tr.xMun} / ${tr.UF ?? ''}`} />
        )}
        {tr.qVol  !== undefined && (
          <Field label="Qtd. Volumes"     value={String(tr.qVol)}                               />
        )}
        {tr.esp   && <Field label="Espécie"            value={tr.esp}                            />}
        {tr.pesoL !== undefined && (
          <Field label="Peso Líquido (kg)" value={formatNumber(tr.pesoL, 3)}                    />
        )}
        {tr.pesoB !== undefined && (
          <Field label="Peso Bruto (kg)"   value={formatNumber(tr.pesoB, 3)}                    />
        )}
      </div>
    </SectionCard>
  )
}

/* ─── Informações Adicionais ──────────────────────────────────── */
export function InformacoesAdicionaisFields({ nfe }: { nfe: NFeDados }) {
  if (!nfe.infCpl && !nfe.infAdFisco) return null
  return (
    <SectionCard title="Informações Adicionais" icon={IconInfo}>
      {nfe.infCpl && (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-medium uppercase tracking-wide text-surface-400">
            Informações Complementares
          </span>
          <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed whitespace-pre-wrap">
            {nfe.infCpl}
          </p>
        </div>
      )}
      {nfe.infAdFisco && (
        <div className="flex flex-col gap-1 pt-2 border-t border-surface-100 dark:border-surface-800">
          <span className="text-[10px] font-medium uppercase tracking-wide text-surface-400">
            Informações do Fisco
          </span>
          <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed whitespace-pre-wrap">
            {nfe.infAdFisco}
          </p>
        </div>
      )}
    </SectionCard>
  )
}