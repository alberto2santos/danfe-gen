import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react'

import {
  X,
  HelpCircle,
  FileText,
  Printer,
  Download,
  Mail,
  Share2,
  Settings,
  ChevronRight,
  Plug,
} from 'lucide-react'

/* ─── Tipos ───────────────────────────────────────────────────── */
type TabId =
  | 'inicio'
  | 'imprimir'
  | 'exportar'
  | 'email'
  | 'compartilhar'
  | 'configuracoes'
  | 'erp'

interface Tab {
  id:    TabId
  label: string
  icon:  React.ReactNode
}

interface HelpModalProps {
  open:              boolean
  onClose:           () => void
  onNavigateToHelp?: () => void
}

/* ─── Tabs ────────────────────────────────────────────────────── */
const TABS: Tab[] = [
  { id: 'inicio',        label: 'Início',        icon: <FileText  size={14} strokeWidth={2} /> },
  { id: 'imprimir',      label: 'Imprimir',      icon: <Printer   size={14} strokeWidth={2} /> },
  { id: 'exportar',      label: 'Exportar',      icon: <Download  size={14} strokeWidth={2} /> },
  { id: 'email',         label: 'E-mail',        icon: <Mail      size={14} strokeWidth={2} /> },
  { id: 'compartilhar',  label: 'Compartilhar',  icon: <Share2    size={14} strokeWidth={2} /> },
  { id: 'configuracoes', label: 'Configurações', icon: <Settings  size={14} strokeWidth={2} /> },
  { id: 'erp',           label: 'ERP',           icon: <Plug      size={14} strokeWidth={2} /> },
]

/* ─── Sub-componente: imagem com fallback para placeholder ───── */
interface ImgPlaceholderProps {
  name:   string
  alt:    string
  ratio?: string
}

function ImgPlaceholder({ name, alt, ratio = '16/9' }: ImgPlaceholderProps) {
  const [errored, setErrored] = useState(false)

  if (!errored) {
    return (
      <img
        src={`/help/${name}`}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setErrored(true)}
        className="
          w-full h-auto rounded-lg
          border border-surface-200 dark:border-surface-700
          object-contain
        "
      />
    )
  }

  /* ─── Fallback enquanto a imagem não existe ──────────────── */
  return (
    <div
      role="img"
      aria-label={alt}
      className="
        w-full rounded-lg overflow-hidden
        border border-surface-200 dark:border-surface-700
        bg-surface-50 dark:bg-surface-900
        flex flex-col items-center justify-center gap-2
        text-surface-300 dark:text-surface-600
        py-8
      "
      style={{ aspectRatio: ratio }}
    >
      <FileText size={28} strokeWidth={1} aria-hidden="true" />
      <span className="text-[10px] font-mono">{name}</span>
    </div>
  )
}

/* ─── Sub-componente: passo numerado ─────────────────────────── */
interface StepProps {
  number:   number
  title:    string
  children: React.ReactNode
}

function Step({ number, title, children }: StepProps) {
  return (
    <div className="flex gap-3">
      <div className="
        shrink-0
        flex items-center justify-center
        w-6 h-6 rounded-full
        bg-brand-600 dark:bg-brand-500
        text-white text-xs font-bold
        mt-0.5
      ">
        {number}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-surface-800 dark:text-surface-100">
          {title}
        </p>
        <div className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  )
}

/* ─── Sub-componente: caixa de dica ──────────────────────────── */
interface TipProps {
  children: React.ReactNode
  type?:    'info' | 'warning' | 'success'
}

function Tip({ children, type = 'info' }: TipProps) {
  const styles = {
    info:    'bg-brand-50 border-brand-100 text-brand-700 dark:bg-brand-950/30 dark:border-brand-900 dark:text-brand-400',
    warning: 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-400',
    success: 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400',
  }

  const icons = {
    info:    'ℹ️',
    warning: '⚠️',
    success: '✅',
  }

  return (
    <div className={`
      flex items-start gap-2
      px-3 py-2.5 rounded-lg border
      text-xs leading-relaxed
      ${styles[type]}
    `}>
      <span className="shrink-0 mt-0.5" aria-hidden="true">{icons[type]}</span>
      <span>{children}</span>
    </div>
  )
}

/* ─── Conteúdo das tabs ───────────────────────────────────────── */
function TabInicio() {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-surface-800 dark:text-surface-100 mb-1">
          O que é o DanfeGen?
        </h3>
        <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
          O <strong>DanfeGen</strong> transforma o arquivo XML da sua Nota Fiscal Eletrônica (NF-e)
          em um <strong>DANFE PDF</strong> — o documento impresso que acompanha a mercadoria.
          Tudo funciona direto no seu navegador, sem cadastro e sem enviar seus dados para nenhum servidor.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-wide">
          Glossário rápido
        </p>
        {[
          { termo: 'XML',   def: 'Arquivo gerado pelo seu sistema fiscal com todos os dados da nota.' },
          { termo: 'NF-e',  def: 'Nota Fiscal Eletrônica — documento fiscal emitido pela empresa.' },
          { termo: 'DANFE', def: 'Documento Auxiliar da NF-e — a versão impressa que acompanha a carga.' },
          { termo: 'SEFAZ', def: 'Órgão do governo responsável por autorizar as notas fiscais.' },
        ].map(({ termo, def }) => (
          <div key={termo} className="flex gap-2 text-xs">
            <span className="
              shrink-0 font-mono font-bold
              px-1.5 py-0.5 rounded
              bg-surface-100 dark:bg-surface-800
              text-surface-700 dark:text-surface-300
            ">
              {termo}
            </span>
            <span className="text-surface-500 dark:text-surface-400 leading-relaxed">{def}</span>
          </div>
        ))}
      </div>

      <div>
        <p className="text-xs font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-wide mb-3">
          Como usar em 3 passos
        </p>
        <div className="space-y-4">
          <Step number={1} title="Faça upload do XML">
            Arraste o arquivo <code className="font-mono bg-surface-100 dark:bg-surface-800 px-1 rounded">.xml</code> para
            a área indicada na tela, ou clique nela para selecionar o arquivo no seu computador.
          </Step>
          <ImgPlaceholder name="help-01-upload-zone.png" alt="Área de upload do DanfeGen" />

          <Step number={2} title="Aguarde a validação">
            O sistema verifica automaticamente se o XML é uma NF-e válida.
            Um símbolo verde confirma que está tudo certo.
          </Step>
          <ImgPlaceholder name="help-02-xml-valido.png" alt="Validação com sucesso" />

          <Step number={3} title="Baixe ou imprima o DANFE">
            Clique em <strong>Baixar PDF</strong> para salvar no computador,
            ou em <strong>Imprimir</strong> para abrir o diálogo de impressão.
          </Step>
          <ImgPlaceholder name="help-03-danfe-preview.png" alt="DANFE gerado na tela" />
        </div>
      </div>

      <Tip type="warning">
        <strong>Arquivo não aceito?</strong> Certifique-se de que o arquivo é um XML de NF-e válido,
        não uma NFC-e ou CT-e. O nome do arquivo geralmente começa com a chave de acesso de 44 dígitos.
      </Tip>
    </div>
  )
}

function TabImprimir() {
  return (
    <div className="space-y-5">
      <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
        Para o DANFE sair no tamanho correto é necessário ajustar algumas configurações
        no diálogo de impressão do navegador.
      </p>

      <div>
        <p className="text-xs font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-wide mb-3">
          Impressão A4 — Chrome e Edge
        </p>
        <div className="space-y-4">
          <Step number={1} title='Destino → "Salvar como PDF" ou sua impressora'>
            Selecione a impressora desejada ou escolha salvar como PDF.
          </Step>
          <Step number={2} title="Margens → Nenhuma">
            No menu de margens, selecione <strong>Nenhuma</strong> para evitar cortes no layout.
          </Step>
          <ImgPlaceholder name="help-06-print-margens.png" alt="Configuração de margens = Nenhuma" />
          <Step number={3} title="Escala → 100%">
            Certifique-se de que a escala está em <strong>100%</strong> e não em modo automático.
          </Step>
          <ImgPlaceholder name="help-07-print-escala.png" alt="Escala de impressão = 100%" />
          <Step number={4} title="Cabeçalhos e rodapés → Desmarcar">
            Desmarque a opção de cabeçalhos e rodapés para não aparecer a URL na impressão.
          </Step>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-wide mb-3">
          Impressora Térmica 80mm
        </p>
        <div className="space-y-4">
          <Step number={1} title="Selecione a aba Etiqueta Térmica">
            Na tela principal, clique em <strong>Etiqueta 80mm</strong> antes de imprimir.
          </Step>
          <Step number={2} title="Configure o tamanho do papel">
            No diálogo de impressão, defina o papel como <strong>80mm × comprimento automático</strong>.
          </Step>
          <ImgPlaceholder name="help-08-print-termica.png" alt="Configuração de impressora térmica 80mm" />
          <Step number={3} title="Margens → Nenhuma e Escala → 100%">
            Mesmas configurações da impressão A4.
          </Step>
        </div>
      </div>

      <Tip type="info">
        O DANFE saiu cortado? Verifique se as margens estão em <strong>Nenhuma</strong> e
        se a escala está em <strong>100%</strong>. Nunca use "Ajustar à página".
      </Tip>
    </div>
  )
}

function TabExportar() {
  return (
    <div className="space-y-5">
      <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
        O DanfeGen permite baixar o DANFE em PDF de forma individual ou em lote (vários XMLs de uma vez).
      </p>

      <div>
        <p className="text-xs font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-wide mb-3">
          Download individual
        </p>
        <div className="space-y-4">
          <Step number={1} title="Faça upload do XML e aguarde a geração">
            Após o upload, o DANFE é gerado automaticamente.
          </Step>
          <Step number={2} title='Clique em "Baixar PDF"'>
            O arquivo será salvo com o nome da chave de acesso da NF-e.
          </Step>
          <ImgPlaceholder name="help-04-botoes-acao.png" alt="Botões de ação: Baixar PDF, Compartilhar, Enviar E-mail" />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-wide mb-3">
          Download em lote (ZIP)
        </p>
        <div className="space-y-4">
          <Step number={1} title="Selecione múltiplos XMLs no upload">
            Na área de upload, selecione ou arraste até <strong>5 arquivos XML</strong> de uma vez.
          </Step>
          <ImgPlaceholder name="help-14-lote-upload.png" alt="Upload de múltiplos XMLs" />
          <Step number={2} title="Aguarde o processamento de todos">
            Uma barra de progresso mostra o andamento de cada nota.
          </Step>
          <Step number={3} title='Clique em "Baixar ZIP"'>
            Todos os DANFEs são empacotados em um único arquivo{' '}
            <code className="font-mono bg-surface-100 dark:bg-surface-800 px-1 rounded">.zip</code>.
          </Step>
          <ImgPlaceholder name="help-15-lote-zip.png" alt="Download do ZIP com múltiplos DANFEs" />
        </div>
      </div>

      <Tip type="success">
        O lote suporta até <strong>5 NF-es simultâneas</strong>. Para volumes maiores,
        processe em grupos de 5.
      </Tip>
    </div>
  )
}

function TabEmail() {
  return (
    <div className="space-y-5">
      <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
        O DanfeGen pode enviar o DANFE em PDF diretamente para o e-mail do destinatário
        após a geração. É necessário configurar o e-mail de envio antes de usar.
      </p>

      <div>
        <p className="text-xs font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-wide mb-3">
          Passo a passo
        </p>
        <div className="space-y-4">
          <Step number={1} title="Configure o e-mail de envio nas Configurações">
            Clique no ícone <strong>⚙️ Configurações</strong> no canto superior direito.
            Na seção <strong>Envio por E-mail</strong>, ative o toggle e preencha:
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Nome do remetente (ex: Bisturi Distribuidora)</li>
              <li>E-mail remetente (domínio verificado)</li>
              <li>E-mail de resposta (reply-to)</li>
              <li>Assunto personalizado</li>
            </ul>
          </Step>
          <ImgPlaceholder name="help-12-settings-email.png" alt="Configuração de e-mail no painel de configurações" />

          <Step number={2} title="Gere o DANFE normalmente">
            Faça o upload do XML e aguarde a geração do PDF.
          </Step>
          <Step number={3} title='Clique em "Enviar por E-mail"'>
            O sistema envia o DANFE em anexo automaticamente para o e-mail
            configurado ou para o e-mail do destinatário presente no XML.
          </Step>
          <ImgPlaceholder name="help-04-botoes-acao.png" alt="Botão Enviar por E-mail" />
        </div>
      </div>

      <Tip type="warning">
        O e-mail remetente precisa ser de um <strong>domínio verificado</strong>.
        Não é possível usar Gmail, Hotmail ou Yahoo como remetente.
        Consulte a aba <strong>Configurações</strong> para mais detalhes.
      </Tip>
    </div>
  )
}

function TabCompartilhar() {
  return (
    <div className="space-y-5">
      <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
        Além do download, é possível compartilhar o DANFE PDF diretamente pelo
        WhatsApp, Telegram, e-mail nativo do celular ou qualquer outro app instalado.
      </p>

      <div>
        <p className="text-xs font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-wide mb-3">
          Como compartilhar
        </p>
        <div className="space-y-4">
          <Step number={1} title="Gere o DANFE normalmente">
            Faça o upload do XML e aguarde a geração.
          </Step>
          <Step number={2} title='Clique em "Compartilhar"'>
            O seu sistema operacional abrirá automaticamente o menu de
            compartilhamento nativo — o mesmo que aparece quando você compartilha uma foto.
          </Step>
          <ImgPlaceholder name="help-04-botoes-acao.png" alt="Botão Compartilhar PDF" />
          <Step number={3} title="Escolha o destino">
            Selecione WhatsApp, Telegram, E-mail, Google Drive, ou qualquer
            outro aplicativo disponível no seu dispositivo.
          </Step>
        </div>
      </div>

      <Tip type="info">
        O botão <strong>Compartilhar</strong> aparece apenas em navegadores compatíveis
        (Chrome no Android, Safari no iOS, Edge no Windows 11).
        No desktop Linux ou versões antigas, o sistema fará o download automático.
      </Tip>
    </div>
  )
}

function TabConfiguracoes() {
  return (
    <div className="space-y-5">
      <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
        As configurações permitem personalizar o DANFE com os dados e a identidade visual
        da sua empresa. São salvas automaticamente no navegador.
      </p>

      {[
        {
          titulo: 'Dados da Empresa',
          img:    'help-09-settings-empresa.png',
          alt:    'Configurações de dados da empresa',
          campos: [
            { campo: 'Razão Social', desc: 'Nome oficial da empresa conforme o CNPJ.' },
            { campo: 'CNPJ',         desc: 'Preenchido automaticamente com máscara.' },
            { campo: 'IE',           desc: 'Inscrição Estadual — opcional.' },
            { campo: 'Endereço',     desc: 'Aparece no cabeçalho do DANFE.' },
            { campo: 'Telefone',     desc: 'Contato exibido no documento.' },
            { campo: 'E-mail',       desc: 'E-mail de contato da empresa.' },
          ],
        },
        {
          titulo: 'Identidade Visual',
          img:    'help-10-settings-logo.png',
          alt:    'Upload de logo',
          campos: [
            { campo: 'Logo',            desc: 'PNG, JPG ou SVG até 512 KB. Aparece no cabeçalho do DANFE.' },
            { campo: 'Posição do Logo', desc: 'Esquerda, centro ou direita no cabeçalho.' },
            { campo: 'Cor Primária',    desc: 'Cor dos blocos e cabeçalhos do DANFE.' },
          ],
        },
        {
          titulo: 'Backup de Configurações',
          img:    null,
          alt:    '',
          campos: [
            { campo: 'Exportar JSON', desc: 'Salva todas as configurações em um arquivo para backup.' },
            { campo: 'Importar JSON', desc: 'Restaura configurações de um backup anterior.' },
          ],
        },
      ].map(sec => (
        <div key={sec.titulo} className="space-y-3">
          <p className="text-xs font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-wide">
            {sec.titulo}
          </p>
          {sec.img && <ImgPlaceholder name={sec.img} alt={sec.alt} />}
          <div className="space-y-2">
            {sec.campos.map(({ campo, desc }) => (
              <div key={campo} className="flex gap-2 text-xs">
                <span className="
                  shrink-0 font-medium
                  text-surface-700 dark:text-surface-300
                  min-w-[110px]
                ">
                  {campo}
                </span>
                <span className="text-surface-500 dark:text-surface-400">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Tip type="success">
        As configurações ficam salvas no navegador. Se trocar de computador,
        use <strong>Exportar JSON</strong> para levar suas configurações junto.
      </Tip>
    </div>
  )
}

function TabERP() {
  return (
    <div className="space-y-5">
      <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
        O DanfeGen pode receber XMLs automaticamente do seu sistema ERP via webhook,
        sem precisar fazer upload manualmente.
      </p>

      <ImgPlaceholder name="help-13-settings-erp.png" alt="Configuração de integração ERP" />

      <div>
        <p className="text-xs font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-wide mb-3">
          Como configurar
        </p>
        <div className="space-y-4">
          <Step number={1} title="Abra as Configurações">
            Clique no ícone <strong>⚙️</strong> no canto superior direito.
          </Step>
          <Step number={2} title="Selecione seu ERP">
            Na seção <strong>Integração ERP</strong>, escolha o sistema que você usa:
            Bling, Omie, Tiny, Conta Azul ou TOTVS.
          </Step>
          <Step number={3} title="Copie a URL do Webhook">
            Cole a URL gerada no painel do seu ERP, na seção de integrações ou webhooks.
          </Step>
          <Step number={4} title="Teste a integração">
            Emita uma NF-e pelo ERP e verifique se o XML chega automaticamente no DanfeGen.
          </Step>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-surface-600 dark:text-surface-400 uppercase tracking-wide">
          ERPs suportados
        </p>
        {[
          { erp: 'Bling',          onde: 'Configurações → Integrações → Webhooks'          },
          { erp: 'Omie',           onde: 'Configurações → Integrações → API / Webhook'      },
          { erp: 'Tiny ERP',       onde: 'Preferências → Integrações → Webhook NF-e'        },
          { erp: 'Conta Azul',     onde: 'Configurações → Integrações → Webhook'            },
          { erp: 'TOTVS Protheus', onde: 'Módulo SIGAFIS → Parâmetros → Webhook NF-e'       },
        ].map(({ erp, onde }) => (
          <div key={erp} className="
            flex flex-col gap-0.5
            px-3 py-2 rounded-lg
            bg-surface-50 dark:bg-surface-900
            border border-surface-100 dark:border-surface-800
            text-xs
          ">
            <span className="font-semibold text-surface-700 dark:text-surface-300">{erp}</span>
            <span className="text-surface-400 dark:text-surface-500">{onde}</span>
          </div>
        ))}
      </div>

      <Tip type="info">
        Não encontrou seu ERP na lista? Entre em contato — novas integrações são adicionadas
        com frequência.
      </Tip>
    </div>
  )
}

/* ─── Mapa de conteúdo das tabs ───────────────────────────────── */
const TAB_CONTENT: Record<TabId, React.ReactNode> = {
  inicio:        <TabInicio />,
  imprimir:      <TabImprimir />,
  exportar:      <TabExportar />,
  email:         <TabEmail />,
  compartilhar:  <TabCompartilhar />,
  configuracoes: <TabConfiguracoes />,
  erp:           <TabERP />,
}

/* ─── Componente principal ────────────────────────────────────── */
export function HelpModal({ open, onClose, onNavigateToHelp }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('inicio')
  const closeButtonRef            = useRef<HTMLButtonElement>(null)
  const firstTabRef               = useRef<HTMLButtonElement>(null)

  /* ─── Foco inicial ──────────────────────────────────────── */
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => firstTabRef.current?.focus(), 150)
      return () => clearTimeout(t)
    }
  }, [open])

  /* ─── Fecha ao pressionar Escape ────────────────────────── */
  useEffect(() => {
    if (!open) return
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  /* ─── Trava scroll do body ──────────────────────────────── */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  /* ─── Navega para /ajuda e fecha o modal ────────────────── */
  const handleNavigate = useCallback(() => {
    onClose()
    onNavigateToHelp?.()
  }, [onClose, onNavigateToHelp])

  if (!open) return null

  return (
    <>
      {/* ─── Overlay ────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="
          fixed inset-0 z-[60]
          bg-black/40 dark:bg-black/60
          backdrop-blur-sm
          animate-fade-in
        "
        onClick={onClose}
      />

      {/* ─── Modal ──────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Central de Ajuda — DanfeGen"
        className="
          fixed inset-0 z-[70]
          flex items-center justify-center
          p-4
          pointer-events-none
        "
      >
        <div
          className="
            pointer-events-auto
            w-full max-w-2xl max-h-[90vh]
            flex flex-col
            bg-white dark:bg-surface-950
            rounded-2xl
            border border-surface-200 dark:border-surface-800
            shadow-2xl
            animate-fade-in
          "
          onClick={e => e.stopPropagation()}
        >

          {/* ─── Header ───────────────────────────────── */}
          <div className="
            flex items-center justify-between
            px-5 py-4
            border-b border-surface-100 dark:border-surface-800
            shrink-0
          ">
            <div className="flex items-center gap-2.5">
              <div className="
                flex items-center justify-center
                w-8 h-8 rounded-lg
                bg-brand-50 dark:bg-brand-950
                text-brand-600 dark:text-brand-400
              ">
                <HelpCircle size={16} strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-surface-900 dark:text-surface-50">
                  Central de Ajuda
                </h2>
                <p className="text-xs text-surface-400 dark:text-surface-500">
                  Tudo o que você precisa saber para usar o DanfeGen
                </p>
              </div>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Fechar ajuda"
              className="
                flex items-center justify-center
                w-8 h-8 rounded-lg
                text-surface-400 hover:text-surface-700
                dark:hover:text-surface-200
                hover:bg-surface-100 dark:hover:bg-surface-800
                transition-colors duration-150
              "
            >
              <X aria-hidden="true" size={16} strokeWidth={2} />
            </button>
          </div>

          {/* ─── Tabs no topo ─────────────────────────── */}
          <div
            role="tablist"
            aria-label="Seções de ajuda"
            className="
              flex items-center gap-0.5
              px-4 pt-3 pb-0
              overflow-x-auto scrollbar-none
              shrink-0
            "
          >
            {TABS.map((tab, i) => {
              const isSelected = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  ref={i === 0 ? firstTabRef : undefined}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isSelected}
                  aria-controls={`panel-${tab.id}`}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-1.5
                    px-3 py-2 rounded-t-lg
                    text-xs font-medium whitespace-nowrap
                    border-b-2 transition-colors duration-150
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400
                    ${isSelected
                      ? 'border-brand-600 text-brand-700 dark:text-brand-400 dark:border-brand-500 bg-brand-50 dark:bg-brand-950/30'
                      : 'border-transparent text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-900'}
                  `}
                >
                  <span aria-hidden="true">{tab.icon}</span>
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* ─── Divisor ──────────────────────────────── */}
          <div className="h-px bg-surface-100 dark:bg-surface-800 shrink-0" />

          {/* ─── Conteúdo da tab ──────────────────────── */}
          <div
            role="tabpanel"
            id={`panel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
            tabIndex={0}
            className="flex-1 overflow-y-auto px-5 py-5 focus:outline-none"
          >
            {TAB_CONTENT[activeTab]}
          </div>

          {/* ─── Footer ───────────────────────────────── */}
          <div className="
            shrink-0
            flex items-center justify-between
            px-5 py-4
            border-t border-surface-100 dark:border-surface-800
            bg-surface-50/50 dark:bg-surface-900/50
            rounded-b-2xl
          ">
            <p className="text-xs text-surface-400 dark:text-surface-500">
              Precisa de mais detalhes?
            </p>
            <button
              type="button"
              onClick={handleNavigate}
              className="
                flex items-center gap-1.5
                px-3 py-1.5 rounded-lg
                text-xs font-medium
                text-brand-600 dark:text-brand-400
                hover:bg-brand-50 dark:hover:bg-brand-950/30
                border border-brand-200 dark:border-brand-800
                transition-colors duration-150
              "
            >
              Ver documentação completa
              <ChevronRight aria-hidden="true" size={12} strokeWidth={2.5} />
            </button>
          </div>

        </div>
      </div>
    </>
  )
}

/* ─── Botão de abertura para o AppHeader ─────────────────────── */
interface HelpButtonProps {
  onClick: () => void
}

export function HelpButton({ onClick }: HelpButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      aria-label="Abrir ajuda"
      title="Ajuda"
      className="
        flex items-center justify-center
        w-8 h-8 rounded-lg
        text-surface-400 hover:text-surface-700
        dark:hover:text-surface-200
        hover:bg-surface-100 dark:hover:bg-surface-800
        transition-colors duration-150
      "
    >
      <HelpCircle aria-hidden="true" size={18} strokeWidth={1.8} />
    </button>
  )
}