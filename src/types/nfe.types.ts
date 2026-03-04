// ─── Tipagem completa NF-e 4.0 ────────────────────────────────

export interface NFeEmitente {
  CNPJ?:   string | undefined
  CPF?:    string | undefined
  xNome:   string
  xFant?:  string | undefined
  xLgr:    string
  nro:     string
  xCpl?:   string | undefined
  xBairro: string
  cMun:    string
  xMun:    string
  UF:      string
  CEP?:    string | undefined
  fone?:   string | undefined
  IE?:     string | undefined
  CRT:     string
}

export interface NFeDestinatario {
  CNPJ?:      string | undefined
  CPF?:       string | undefined
  xNome:      string
  xLgr:       string
  nro:        string
  xCpl?:      string | undefined
  xBairro:    string
  cMun:       string
  xMun:       string
  UF:         string
  CEP?:       string | undefined
  fone?:      string | undefined
  email?:     string | undefined
  indIEDest?: number | undefined
}

export interface NFeProduto {
  nItem:     number
  cProd:     string
  cEAN?:     string | undefined
  xProd:     string
  NCM:       string
  CFOP:      string
  uCom:      string
  qCom:      number
  vUnCom:    number
  vProd:     number
  xPed?:     string | undefined
  nItemPed?: string | undefined
  CST?:      string | undefined
  CSOSN?:    string | undefined
  pICMS?:    number | undefined
  vICMS?:    number | undefined
  pIPI?:     number | undefined
  vIPI?:     number | undefined
}

export interface NFeTotais {
  vBC:       number
  vICMS:     number
  vIPI?:     number | undefined
  vPIS:      number
  vCOFINS:   number
  vProd:     number
  vFrete?:   number | undefined
  vSeg?:     number | undefined
  vDesc?:    number | undefined
  vOutro?:   number | undefined
  vNF:       number
  vTotTrib?: number | undefined
}

export interface NFeTransporte {
  modFrete:  string
  xNome?:    string | undefined
  CNPJ?:     string | undefined
  IE?:       string | undefined
  xEnder?:   string | undefined
  xMun?:     string | undefined
  UF?:       string | undefined
  placa?:    string | undefined
  qVol?:     number | undefined
  esp?:      string | undefined
  marca?:    string | undefined
  pesoL?:    number | undefined
  pesoB?:    number | undefined
}

export interface NFeDupFat {
  nFat?:  string | undefined
  vOrig?: number | undefined
  vDesc?: number | undefined
  vLiq?:  number | undefined
}

export interface NFeDup {
  nDup:  string
  dVenc: string
  vDup:  number
}

export interface NFeCobr {
  fat?: NFeDupFat | undefined
  dup?: NFeDup[]  | undefined
}

export interface NFeDados {
  chNFe:     string
  nNF:       string
  serie:     string
  dhEmi:     string
  dhSaiEnt?: string | undefined
  natOp:     string
  tpNF:      string
  tpEmis?:   string | undefined
  tpAmb?:    string | undefined
  finNFe?:   string | undefined
  cMunFG?:   string | undefined

  emitente:     NFeEmitente
  destinatario: NFeDestinatario
  produtos:     NFeProduto[]
  totais:       NFeTotais
  transporte?:  NFeTransporte | undefined

  cobr?: NFeCobr | undefined

  infCpl?:     string | undefined
  infAdFisco?: string | undefined
  xJust?:      string | undefined
}

// ─── Status do fluxo de telas ─────────────────────────────────
export type AppStep    = 'upload' | 'preview' | 'download'
export type DanfeFormat = 'a4' | 'thermal'

export interface ParseResult {
  success: boolean
  data?:   NFeDados  | undefined
  error?:  string    | undefined
}