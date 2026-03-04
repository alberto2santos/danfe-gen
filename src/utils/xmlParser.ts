import type {
  NFeDados, NFeEmitente, NFeDestinatario,
  NFeProduto, NFeTotais, NFeTransporte,
} from '@/types/nfe.types'
import type { NFeRaw } from '@/schemas/nfeSchema'
import { formatCNPJ, formatCPF, formatCEP, formatPhone } from '@/utils/formatters'

/* ============================================================
   extractNFe
   Converte o objeto raw (já validado pelo Zod) no tipo NFeDados
   normalizado e tipado que o restante da aplicação consome.
   ============================================================ */
export function extractNFe(raw: NFeRaw, chNFe: string): NFeDados {
  return {
    // ─── Identificação ─────────────────────────────────────
    chNFe:    String(chNFe).replace(/\D/g, ''),  // ✅ String() blindagem extra
    nNF:      String(raw.ide.nNF),
    serie:    String(raw.ide.serie),
    dhEmi:    raw.ide.dhEmi,
    dhSaiEnt: raw.ide.dhSaiEnt,
    natOp:    raw.ide.natOp,
    tpNF:     raw.ide.tpNF,
    tpEmis:   raw.ide.tpEmis,
    tpAmb:    raw.ide.tpAmb,
    finNFe:   raw.ide.finNFe,
    cMunFG:   raw.ide.cMunFG,

    // ─── Emitente ───────────────────────────────────────────
    emitente:     extractEmitente(raw.emit),

    // ─── Destinatário ───────────────────────────────────────
    destinatario: extractDestinatario(raw.dest),

    // ─── Produtos ───────────────────────────────────────────
    produtos:     raw.det.map(extractProduto),

    // ─── Totais ─────────────────────────────────────────────
    totais:       extractTotais(raw.total),

    // ─── Transporte ─────────────────────────────────────────
    transporte:   raw.transp ? extractTransporte(raw.transp) : undefined,

    // ─── Cobrança / duplicatas ──────────────────────────────
    cobr: raw.cobr ? {
      fat: raw.cobr.fat ? {
        nFat:  raw.cobr.fat.nFat  ? String(raw.cobr.fat.nFat)  : undefined,
        vOrig: raw.cobr.fat.vOrig !== undefined ? Number(raw.cobr.fat.vOrig) : undefined,
        vDesc: raw.cobr.fat.vDesc !== undefined ? Number(raw.cobr.fat.vDesc) : undefined,
        vLiq:  raw.cobr.fat.vLiq  !== undefined ? Number(raw.cobr.fat.vLiq)  : undefined,
      } : undefined,
      dup: raw.cobr.dup?.map(d => ({
        nDup:  String(d.nDup),
        dVenc: d.dVenc,
        vDup:  Number(d.vDup),
      })),
    } : undefined,

    // ─── Informações adicionais ─────────────────────────────
    infCpl:     raw.infAdic?.infCpl,
    infAdFisco: raw.infAdic?.infAdFisco,
  }
}

/* ─── Emitente ────────────────────────────────────────────────── */
function extractEmitente(emit: NFeRaw['emit']): NFeEmitente {
  const end = emit.enderEmit
  return {
    CNPJ:    emit.CNPJ ? formatCNPJ(emit.CNPJ) : undefined,
    CPF:     emit.CPF  ? formatCPF(emit.CPF)   : undefined,
    xNome:   emit.xNome.trim(),
    xFant:   emit.xFant?.trim(),
    xLgr:    end.xLgr,
    nro:     String(end.nro),
    xCpl:    end.xCpl,
    xBairro: end.xBairro,
    cMun:    String(end.cMun),
    xMun:    end.xMun,
    UF:      end.UF,
    CEP:     end.CEP ? formatCEP(end.CEP) : undefined,
    fone:    end.fone ? formatPhone(String(end.fone)) : undefined,
    IE:      emit.IE,
    CRT:     emit.CRT,
  }
}

/* ─── Destinatário ────────────────────────────────────────────── */
function extractDestinatario(dest: NFeRaw['dest']): NFeDestinatario {
  const end = dest.enderDest
  return {
    CNPJ:      dest.CNPJ ? formatCNPJ(dest.CNPJ) : undefined,
    CPF:       dest.CPF  ? formatCPF(dest.CPF)   : undefined,
    xNome:     dest.xNome.trim(),
    xLgr:      end.xLgr,
    nro:       String(end.nro),
    xCpl:      end.xCpl,
    xBairro:   end.xBairro,
    cMun:      String(end.cMun),
    xMun:      end.xMun,
    UF:        end.UF,
    CEP:       end.CEP ? formatCEP(end.CEP) : undefined,
    fone:      end.fone ? formatPhone(String(end.fone)) : undefined,
    email:     dest.email?.toLowerCase().trim(),
    indIEDest: dest.indIEDest !== undefined ? Number(dest.indIEDest) : undefined,
  }
}

/* ─── Produto / item ──────────────────────────────────────────── */
function extractProduto(det: NFeRaw['det'][number]): NFeProduto {
  const p   = det.prod
  const imp = det.imposto

  // ─── Extrai CST ou CSOSN do bloco ICMS ──────────────────
  const icmsBlock = imp?.ICMS
    ? Object.values(imp.ICMS)[0] as Record<string, unknown>
    : undefined

  const CST   = icmsBlock?.CST   ? String(icmsBlock.CST)   : undefined
  const CSOSN = icmsBlock?.CSOSN ? String(icmsBlock.CSOSN) : undefined
  const pICMS = icmsBlock?.pICMS ? Number(icmsBlock.pICMS) : undefined
  const vICMS = icmsBlock?.vICMS ? Number(icmsBlock.vICMS) : undefined

  // ─── Extrai IPI ──────────────────────────────────────────
  const ipiBlock = imp?.IPI
    ? Object.values(imp.IPI)[0] as Record<string, unknown>
    : undefined

  const pIPI = ipiBlock?.pIPI ? Number(ipiBlock.pIPI) : undefined
  const vIPI = ipiBlock?.vIPI ? Number(ipiBlock.vIPI) : undefined

  return {
    nItem:    Number(det['@_nItem']),
    cProd:    String(p.cProd),
    cEAN:     p.cEAN ? String(p.cEAN) : undefined,
    xProd:    String(p.xProd).trim(),
    NCM:      String(p.NCM),
    CFOP:     String(p.CFOP),
    uCom:     String(p.uCom),
    qCom:     Number(p.qCom),
    vUnCom:   Number(p.vUnCom),
    vProd:    Number(p.vProd),
    xPed:     p.xPed     ? String(p.xPed)     : undefined,
    nItemPed: p.nItemPed ? String(p.nItemPed) : undefined,
    CST,
    CSOSN,
    pICMS,
    vICMS,
    pIPI,
    vIPI,
  }
}

/* ─── Totais ──────────────────────────────────────────────────── */
function extractTotais(total: NFeRaw['total']): NFeTotais {
  const t = total.ICMSTot
  return {
    vBC:      Number(t.vBC),
    vICMS:    Number(t.vICMS),
    vIPI:     t.vIPI    !== undefined ? Number(t.vIPI)    : undefined,
    vPIS:     Number(t.vPIS),
    vCOFINS:  Number(t.vCOFINS),
    vProd:    Number(t.vProd),
    vFrete:   t.vFrete  !== undefined ? Number(t.vFrete)  : undefined,
    vSeg:     t.vSeg    !== undefined ? Number(t.vSeg)    : undefined,
    vDesc:    t.vDesc   !== undefined ? Number(t.vDesc)   : undefined,
    vOutro:   t.vOutro  !== undefined ? Number(t.vOutro)  : undefined,
    vNF:      Number(t.vNF),
    vTotTrib: t.vTotTrib !== undefined ? Number(t.vTotTrib) : undefined,
  }
}

/* ─── Transporte ──────────────────────────────────────────────── */
function extractTransporte(transp: NonNullable<NFeRaw['transp']>): NFeTransporte {
  const tr  = transp.transporta
  const vol = transp.vol?.[0]

  return {
    modFrete: transp.modFrete,
    xNome:    tr?.xNome,
    CNPJ:     tr?.CNPJ ? formatCNPJ(tr.CNPJ) : undefined,
    IE:       tr?.IE,
    xEnder:   tr?.xEnder,
    xMun:     tr?.xMun,
    UF:       tr?.UF,
    placa:    transp.veicTransp?.placa,
    qVol:     vol?.qVol  !== undefined ? Number(vol.qVol)  : undefined,
    esp:      vol?.esp,
    marca:    vol?.marca,
    pesoL:    vol?.pesoL !== undefined ? Number(vol.pesoL) : undefined,
    pesoB:    vol?.pesoB !== undefined ? Number(vol.pesoB) : undefined,
  }
}