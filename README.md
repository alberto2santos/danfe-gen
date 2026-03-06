# DanfeGen — Conversor NF-e para DANFE PDF

![DanfeGen Preview](public/og-preview.png)

Converta XML de NF-e em **DANFE PDF A4** e **Etiqueta Térmica 80mm** direto no navegador.
100% local, sem cadastro, sem envio de dados.

[![Deploy](https://img.shields.io/badge/deploy-vercel-000?logo=vercel)](https://danfegen.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8?logo=pwa)](https://danfegen.vercel.app)

---

## ✨ Funcionalidades

- 📄 **DANFE A4** — layout oficial SEFAZ com todos os campos obrigatórios
- 🖨️ **Etiqueta Térmica 80mm** — otimizada para impressoras térmicas
- 📦 **Processamento em lote** — múltiplos XMLs de uma vez, exporta ZIP
- 🔒 **100% local** — nenhum XML é enviado para servidores
- 🌙 **Dark mode** — tema claro e escuro automático
- ⚙️ **Configurações da empresa** — logo, cor primária e integração ERP
- 📤 **Compartilhamento direto** — Web Share API (WhatsApp, Drive, etc.) com fallback para download
- 📧 **Envio por e-mail** — DANFE em anexo via Resend, configurável por empresa
- 📲 **PWA instalável** — funciona offline após primeira visita
- 🏛️ **Reforma Tributária 2026** — suporte a IBS, CBS e DIFAL no schema NF-e 4.00
- 📱 **Responsivo** — funciona em desktop e mobile

---

## 🚀 Demo

**[danfegen.vercel.app](https://danfegen.vercel.app)**

---

## 🛠️ Tecnologias

| Camada      | Tecnologia                        |
|-------------|-----------------------------------|
| Framework   | React 19 + TypeScript 5.9         |
| Build       | Vite 6 + SWC                      |
| Estilo      | Tailwind CSS 3                    |
| PDF         | @react-pdf/renderer 4             |
| Validação   | Zod 4                             |
| E-mail      | Resend SDK 4                      |
| PWA         | Workbox 7                         |
| Deploy      | Vercel (Edge + Functions)         |

---

## 📁 Estrutura do Projeto

```
danfe-gen/
├── api/                          # Vercel Functions (Node.js)
│   ├── generate-pdf.ts           # Gera PDF/ZIP server-side (single + batch)
│   ├── parse-xml.ts              # Parseia e valida XML NF-e
│   └── send-email.ts             # Envia DANFE por e-mail via Resend
├── public/                       # Assets estáticos
│   ├── fonts/                    # Inter Variable (woff2 + ttf)
│   ├── help/                     # Imagens da documentação in-app
│   ├── danfegen-icon.svg         # Ícone principal
│   ├── danfegen-icon-192.png     # Ícone PWA 192×192
│   ├── danfegen-icon-512.png     # Ícone PWA 512×512
│   ├── og-preview.png            # Preview Open Graph
│   └── manifest.webmanifest      # PWA manifest
├── src/
│   ├── components/
│   │   ├── Danfe/                # DanfeA4, DanfeThermal
│   │   ├── Help/                 # HelpModal, HelpFAQ, HelpSearch, HelpSection
│   │   ├── Layout/               # AppHeader, AppFooter
│   │   ├── Preview/              # DanfePreview, DanfeFields
│   │   ├── Settings/             # CompanyConfig, ErpConnect
│   │   ├── UI/                   # Alert, Badge, Button, Progress, Spinner, Toast
│   │   └── Upload/               # UploadZone, BatchProgress
│   ├── contexts/                 # CompanyContext, NFeContext, ThemeContext
│   ├── hooks/
│   │   ├── useBatchProcessor.ts  # Processa múltiplos XMLs em lote
│   │   ├── useCompanyConfig.ts   # Persiste e gerencia config da empresa
│   │   ├── useEmailSender.ts     # Envia e-mail via /api/send-email
│   │   ├── useErpConnection.ts   # Integração com ERP via webhook
│   │   ├── usePdfGenerator.ts    # Gera (generateA4), compartilha (shareA4) e envia PDF
│   │   ├── useThermalPrint.ts    # Impressão térmica 80mm via window.print()
│   │   └── useXmlParser.ts       # Parseia e valida XML NF-e com Zod
│   ├── pages/
│   │   └── HelpPage.tsx          # Página de ajuda com FAQ e busca
│   ├── schemas/                  # Zod schemas (nfeSchema, nfeProcSchema)
│   ├── types/                    # TypeScript types (nfe, company, erp)
│   └── utils/
│       ├── accessKeyValidator.ts # Validação da chave de acesso NF-e
│       ├── cnpjValidator.ts      # Validação de CNPJ
│       ├── code128.ts            # Geração de código de barras Code 128
│       ├── danfeLayout.ts        # Constantes de layout do DANFE A4
│       ├── formatters.ts         # Formatação de moeda, datas, CNPJ, etc.
│       ├── qrCodeSvg.ts          # Geração de QR Code em SVG puro
│       ├── xmlParser.ts          # Extrai NFeDados do objeto Zod validado
│       └── zipProcessor.ts       # Compacta múltiplos PDFs em ZIP
├── middleware.ts                 # Vercel Edge Middleware (auth + rate limit)
└── vercel.json                   # Configuração de deploy e CSP
```

---

## 💻 Rodando Localmente

### Pré-requisitos

- Node.js >= 20
- npm >= 10

### Instalação

```bash
# Clone o repositório
git clone https://github.com/alberto2santos/danfe-gen.git
cd danfe-gen

# Instale as dependências
npm install
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
# Chave master da API (server-side) — nunca commitar
DANFEGEN_API_KEY=sua-chave-master-aqui

# Chave pública para demo — pode commitar
DANFEGEN_DEMO_KEY=demo-public-key-2024

# Resend — envio de e-mails (server-side) — nunca commitar
RESEND_API_KEY=re_suachaveaqui
```

> ⚠️ O arquivo `.env` já está no `.gitignore`. Nunca commite chaves reais.

### Iniciando

```bash
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173)

> **Nota:** o comando `vercel dev` também funciona e disponibiliza as Vercel Functions
> localmente. Na primeira execução, autentica com `vercel login` e confirma o link
> com o projeto existente.

---

## 📦 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento (Vite)
npm run build        # Build de produção
npm run preview      # Preview do build local
npm run analyze      # Bundle analyzer (rollup-plugin-visualizer)
npm run lint         # ESLint (zero warnings)
npm run type-check   # TypeScript sem emitir arquivos
npm run audit        # Auditoria de segurança npm
```

---

## 🖨️ Configurando Impressora Térmica

No diálogo de impressão do navegador:

1. **Margens** → Nenhuma
2. **Cabeçalhos e Rodapés** → Desmarcar
3. **Escala** → 100%
4. **Tamanho do papel** → 80mm × Comprimento automático

---

## 🔌 API (Vercel Functions)

### `POST /api/generate-pdf`

Gera PDF de uma NF-e ou lote de NF-es.

```json
// Single
{
  "mode": "single",
  "nfeData": { ... },
  "config": { ... }
}

// Batch (máx. 5 NF-es)
{
  "mode": "batch",
  "items": [
    { "nfeData": { ... } },
    { "nfeData": { ... } }
  ]
}
```

**Headers obrigatórios:**
```
x-danfegen-key: sua-chave-api
```

---

### `POST /api/parse-xml`

Parseia e valida um XML NF-e.

```json
{
  "xml": "<nfeProc>...</nfeProc>"
}
```

---

### `POST /api/send-email`

Envia o DANFE em PDF por e-mail via Resend.

```json
{
  "to":        "cliente@email.com",
  "fromName":  "Minha Empresa",
  "fromEmail": "nfe@minhaempresa.com.br",
  "replyTo":   "financeiro@minhaempresa.com.br",
  "subject":   "DANFE NF-e 307873 — Minha Empresa",
  "body":      "<p>Segue o DANFE em anexo.</p>",
  "pdfBase64": "JVBERi0x...",
  "filename":  "DANFE-NF000307873-S50.pdf"
}
```

> Requer `RESEND_API_KEY` configurada nas variáveis de ambiente da Vercel.

---

## 📧 Configurando Envio por E-mail

1. Crie uma conta gratuita em [resend.com](https://resend.com) (3.000 e-mails/mês)
2. Verifique seu domínio em **Domains → Add Domain**
3. Gere uma API Key em **API Keys → Create Key** com `Sending access`
4. Adicione `RESEND_API_KEY` nas variáveis de ambiente da Vercel
5. Configure remetente e templates na aba **Configurações → Envio por E-mail** do DanfeGen

---

## 📤 Compartilhamento de PDF

O botão **Compartilhar** usa a [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) para enviar o PDF diretamente pelo WhatsApp, Telegram, Google Drive e outros apps do dispositivo.

**Comportamento por contexto:**

| Contexto | Comportamento |
|---|---|
| Produção (Vercel) | Gera PDF via API + compartilha arquivo |
| Dev com `vercel dev` | Gera PDF via API + compartilha arquivo |
| Dev com `npm run dev` | Fallback: compartilha texto + link |
| Browser sem suporte | Fallback: download direto do PDF |

---

## 📲 PWA — Instalação

O DanfeGen pode ser instalado como app nativo no desktop e mobile:

- **Chrome/Edge** → barra de endereços → ícone de instalação
- **Android** → menu do navegador → "Adicionar à tela inicial"
- **iOS Safari** → compartilhar → "Adicionar à Tela de Início"

Após instalado, funciona offline para XMLs já processados.

---

## 🏛️ Suporte à Reforma Tributária 2026

O schema NF-e 4.00 foi atualizado para suportar os novos campos fiscais:

- **IBS** — Imposto sobre Bens e Serviços
- **CBS** — Contribuição sobre Bens e Serviços
- **IBSCBS** — campo unificado no `<imposto>` de cada item
- **IBSCBSTot** — totalizador no `<total>`
- **ICMSUFDest** — DIFAL (já suportado)

---

## 🔒 Segurança

- XMLs processados **100% no navegador** — nunca trafegam pela rede
- API protegida por `x-danfegen-key` via Edge Middleware
- Rate limiting: 5 req/min (demo) · 10 req/min (master)
- CORS restrito ao domínio de produção
- CSP configurada com suporte a WebAssembly (`wasm-unsafe-eval`)
- Chaves de API nunca expostas no bundle client-side

---

## 🐛 Problemas Conhecidos

### Marca d'água "SEM VALOR FISCAL" em NF-e de produção

Se a marca d'água aparecer em notas com `tpAmb=1`, é cache do Vite do `@react-pdf/renderer`.
Resolução:

```bash
npx vite --force
```

### `ECONNREFUSED` no botão Compartilhar em dev local

O endpoint `/api/generate-pdf` é uma Vercel Function — não existe no `npm run dev` puro.
Use `vercel dev` para ter as Functions disponíveis localmente, ou use o deploy de produção para testar o compartilhamento com PDF.

---

## 📄 Licença

MIT © 2026 [Alberto Luiz](https://github.com/alberto2santos)
