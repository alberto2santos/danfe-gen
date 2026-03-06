/* ─────────────────────────────────────────────────────────────────
   help.content.ts
   Centraliza todo o texto do sistema de ajuda (modal + /ajuda).
   Para editar qualquer texto, altere apenas este arquivo.
───────────────────────────────────────────────────────────────── */

export type TipType = 'info' | 'warning' | 'success'

export interface HelpStep {
  title:   string
  content: string
}

export interface HelpTip {
  type:    TipType
  content: string
}

export interface HelpImage {
  file: string
  alt:  string
}

export interface HelpSection {
  id:       string
  title:    string
  steps?:   HelpStep[]
  tips?:    HelpTip[]
  images?:  HelpImage[]
  content?: string
}

export interface HelpTab {
  id:       string
  label:    string
  sections: HelpSection[]
}

export interface HelpFAQItem {
  question: string
  answer:   string
}

export interface HelpGlossaryItem {
  term:       string
  definition: string
}

/* ─── Glossário ──────────────────────────────────────────────── */
export const HELP_GLOSSARY: HelpGlossaryItem[] = [
  {
    term:       'XML',
    definition: 'Arquivo gerado pelo seu sistema fiscal com todos os dados da nota.',
  },
  {
    term:       'NF-e',
    definition: 'Nota Fiscal Eletrônica — documento fiscal emitido pela empresa.',
  },
  {
    term:       'DANFE',
    definition: 'Documento Auxiliar da NF-e — a versão impressa que acompanha a carga.',
  },
  {
    term:       'SEFAZ',
    definition: 'Órgão do governo responsável por autorizar as notas fiscais.',
  },
  {
    term:       'Chave de Acesso',
    definition: 'Número de 44 dígitos que identifica unicamente cada NF-e. Geralmente é o nome do arquivo XML.',
  },
  {
    term:       'DANFE Simplificado',
    definition: 'Versão reduzida do DANFE para impressoras térmicas — utilizada em entregas e logística.',
  },
  {
    term:       'Webhook',
    definition: 'URL que recebe dados automaticamente de outro sistema. Usado para integrar o DanfeGen com ERPs.',
  },
  {
    term:       'Lote',
    definition: 'Processamento de múltiplos arquivos XML de uma só vez.',
  },
]

/* ─── Conteúdo das tabs ──────────────────────────────────────── */
export const HELP_TABS: HelpTab[] = [

  /* ── 1. Início ───────────────────────────────────────────── */
  {
    id:    'inicio',
    label: 'Início',
    sections: [
      {
        id:    'o-que-e',
        title: 'O que é o DanfeGen?',
        content: `
          O DanfeGen transforma o arquivo XML da sua Nota Fiscal Eletrônica (NF-e)
          em um DANFE PDF — o documento impresso que acompanha a mercadoria.
          Tudo funciona direto no seu navegador, sem cadastro e sem enviar
          seus dados para nenhum servidor.
        `,
      },
      {
        id:    'passo-a-passo',
        title: 'Como usar em 3 passos',
        steps: [
          {
            title:   'Faça upload do XML',
            content: `
              Arraste o arquivo .xml para a área indicada na tela,
              ou clique nela para selecionar o arquivo no seu computador.
              Também é possível enviar um .zip com até 10 XMLs para processamento em lote.
            `,
          },
          {
            title:   'Aguarde a validação',
            content: `
              O sistema verifica automaticamente se o XML é uma NF-e válida.
              Um símbolo verde confirma que está tudo certo.
              Em caso de erro, uma mensagem explica o que aconteceu.
            `,
          },
          {
            title:   'Baixe ou imprima o DANFE',
            content: `
              Clique em Baixar PDF para salvar no computador,
              em Imprimir para abrir o diálogo de impressão,
              ou em Compartilhar para enviar pelo WhatsApp, e-mail ou outro app.
            `,
          },
        ],
        images: [
          { file: 'help-01-upload-zone.png', alt: 'Área de upload do DanfeGen' },
          { file: 'help-02-xml-valido.png',  alt: 'Validação com sucesso'      },
          { file: 'help-03-danfe-preview.png', alt: 'DANFE gerado na tela'     },
        ],
        tips: [
          {
            type:    'warning',
            content: `
              Arquivo não aceito? Certifique-se de que o arquivo é um XML de NF-e válido,
              não uma NFC-e ou CT-e. O nome do arquivo geralmente começa com a chave
              de acesso de 44 dígitos.
            `,
          },
        ],
      },
    ],
  },

  /* ── 2. Imprimir ─────────────────────────────────────────── */
  {
    id:    'imprimir',
    label: 'Imprimir',
    sections: [
      {
        id:      'impressao-a4',
        title:   'Impressão A4 — Chrome e Edge',
        content: 'Para o DANFE sair no tamanho correto, ajuste as configurações no diálogo de impressão do navegador.',
        steps: [
          {
            title:   'Destino → sua impressora ou "Salvar como PDF"',
            content: 'Selecione a impressora desejada ou escolha salvar como PDF para conferir antes de imprimir.',
          },
          {
            title:   'Margens → Nenhuma',
            content: 'No menu de margens, selecione Nenhuma para evitar cortes no layout do DANFE.',
          },
          {
            title:   'Escala → 100%',
            content: 'Certifique-se de que a escala está em 100% e não em modo "Ajustar à página".',
          },
          {
            title:   'Cabeçalhos e rodapés → Desmarcar',
            content: 'Desmarque essa opção para não aparecer a URL ou data na impressão.',
          },
        ],
        images: [
          { file: 'help-05-print-margens.png', alt: 'Configuração de margens = Nenhuma' },
          { file: 'help-07-print-escala.png',  alt: 'Escala de impressão = 100%'        },
        ],
        tips: [
          {
            type:    'info',
            content: `
              O DANFE saiu cortado? Verifique se as margens estão em Nenhuma e
              se a escala está em 100%. Nunca use "Ajustar à página".
            `,
          },
        ],
      },
      {
        id:    'impressora-termica',
        title: 'Impressora Térmica 80mm',
        steps: [
          {
            title:   'Selecione a aba Etiqueta Térmica',
            content: 'Na tela principal, clique em Etiqueta 80mm antes de imprimir.',
          },
          {
            title:   'Configure o tamanho do papel',
            content: 'No diálogo de impressão, defina o papel como 80mm × comprimento automático.',
          },
          {
            title:   'Margens → Nenhuma e Escala → 100%',
            content: 'Mesmas configurações da impressão A4.',
          },
        ],
        images: [
          { file: 'help-08-print-termica.png', alt: 'Configuração de impressora térmica 80mm' },
        ],
        tips: [
          {
            type:    'warning',
            content: `
              Impressora térmica cortando o conteúdo? Confirme que o driver está configurado
              para papel de 80mm de largura e comprimento contínuo (auto).
            `,
          },
        ],
      },
    ],
  },

  /* ── 3. Exportar ─────────────────────────────────────────── */
  {
    id:    'exportar',
    label: 'Exportar',
    sections: [
      {
        id:    'download-individual',
        title: 'Download individual',
        content: 'Baixe o DANFE de uma única NF-e diretamente no seu computador.',
        steps: [
          {
            title:   'Faça upload do XML e aguarde a geração',
            content: 'Após o upload, o DANFE é gerado automaticamente na tela.',
          },
          {
            title:   'Clique em "Baixar PDF"',
            content: 'O arquivo será salvo com o nome da chave de acesso da NF-e.',
          },
        ],
        images: [
          { file: 'help-04-botoes-acao.png', alt: 'Botões de ação: Baixar PDF, Compartilhar, Enviar E-mail' },
        ],
      },
      {
        id:    'download-lote',
        title: 'Download em lote (ZIP)',
        content: 'Processe até 10 NF-es de uma vez e baixe todos os DANFEs em um único arquivo ZIP.',
        steps: [
          {
            title:   'Prepare o arquivo ZIP',
            content: `
              Coloque todos os XMLs em um arquivo .zip.
              Você pode organizar em subpastas por mês no formato AAAA/MM/arquivo.xml
              (ex: 2026/03/nfe.xml). Evite nomes genéricos como "xmls" ou "notas".
            `,
          },
          {
            title:   'Arraste ou selecione o ZIP',
            content: 'Na área de upload, selecione ou arraste o arquivo .zip.',
          },
          {
            title:   'Selecione os XMLs para processar',
            content: `
              O sistema extrai e lista todos os XMLs encontrados.
              Marque os que deseja processar (máximo 10 por vez).
              XMLs inválidos aparecem desabilitados com o motivo do erro.
            `,
          },
          {
            title:   'Clique em "Processar NF-es"',
            content: 'Uma barra de progresso mostra o andamento de cada nota.',
          },
          {
            title:   'Clique em "Baixar ZIP"',
            content: 'Todos os DANFEs são empacotados em um único arquivo .zip.',
          },
        ],
        images: [
          { file: 'help-14-lote-upload.png', alt: 'Upload de arquivo ZIP com múltiplos XMLs' },
          { file: 'help-15-lote-zip.png',    alt: 'Download do ZIP com múltiplos DANFEs'     },
        ],
        tips: [
          {
            type:    'success',
            content: `
              O lote suporta até 10 NF-es por vez. Para volumes maiores,
              divida em grupos de 10 e processe um de cada vez.
            `,
          },
          {
            type:    'warning',
            content: `
              Não coloque outros tipos de arquivo (imagens, PDFs, planilhas) dentro do ZIP.
              O sistema aceita apenas arquivos .xml de NF-e.
            `,
          },
        ],
      },
    ],
  },

  /* ── 4. E-mail ───────────────────────────────────────────── */
  {
    id:    'email',
    label: 'E-mail',
    sections: [
      {
        id:    'envio-email',
        title: 'Como enviar o DANFE por e-mail',
        content: `
          O DanfeGen pode enviar o DANFE em PDF diretamente para o e-mail
          do destinatário após a geração. É necessário configurar o e-mail
          de envio antes de usar.
        `,
        steps: [
          {
            title:   'Configure o e-mail de envio nas Configurações',
            content: `
              Clique no ícone ⚙️ Configurações no canto superior direito.
              Na seção Envio por E-mail, ative o toggle e preencha:
              nome do remetente, e-mail remetente (domínio verificado),
              e-mail de resposta (reply-to) e assunto personalizado.
            `,
          },
          {
            title:   'Gere o DANFE normalmente',
            content: 'Faça o upload do XML e aguarde a geração do PDF.',
          },
          {
            title:   'Clique em "Enviar por E-mail"',
            content: `
              O sistema envia o DANFE em anexo automaticamente para o e-mail
              configurado ou para o e-mail do destinatário presente no XML da NF-e.
            `,
          },
        ],
        images: [
          { file: 'help-12-settings-email.png', alt: 'Configuração de e-mail no painel de configurações' },
          { file: 'help-04-botoes-acao.png',    alt: 'Botão Enviar por E-mail'                           },
        ],
        tips: [
          {
            type:    'warning',
            content: `
              O e-mail remetente precisa ser de um domínio verificado.
              Não é possível usar Gmail, Hotmail ou Yahoo como remetente.
              O envio é feito via Resend — configure o domínio em resend.com.
            `,
          },
          {
            type:    'info',
            content: `
              O assunto do e-mail suporta variáveis dinâmicas:
              {{nNF}} = número da nota, {{emitente}} = nome da empresa, {{serie}} = série da NF-e.
              Exemplo: "DANFE NF-e {{nNF}} — {{emitente}}".
            `,
          },
        ],
      },
    ],
  },

  /* ── 5. Compartilhar ─────────────────────────────────────── */
  {
    id:    'compartilhar',
    label: 'Compartilhar',
    sections: [
      {
        id:    'como-compartilhar',
        title: 'Como compartilhar o DANFE',
        content: `
          Além do download, é possível compartilhar o DANFE PDF diretamente pelo
          WhatsApp, Telegram, e-mail nativo do celular ou qualquer outro app instalado.
        `,
        steps: [
          {
            title:   'Gere o DANFE normalmente',
            content: 'Faça o upload do XML e aguarde a geração.',
          },
          {
            title:   'Clique em "Compartilhar"',
            content: `
              O sistema operacional abrirá automaticamente o menu de compartilhamento
              nativo — o mesmo que aparece quando você compartilha uma foto ou documento.
            `,
          },
          {
            title:   'Escolha o destino',
            content: `
              Selecione WhatsApp, Telegram, E-mail, Google Drive ou qualquer
              outro aplicativo disponível no seu dispositivo.
            `,
          },
        ],
        images: [
          { file: 'help-04-botoes-acao.png', alt: 'Botão Compartilhar PDF' },
        ],
        tips: [
          {
            type:    'info',
            content: `
              O botão Compartilhar aparece apenas em navegadores compatíveis
              (Chrome no Android, Safari no iOS, Edge no Windows 11).
              No desktop Linux ou versões antigas, o sistema fará o download automático.
            `,
          },
        ],
      },
    ],
  },

  /* ── 6. Configurações ────────────────────────────────────── */
  {
    id:    'configuracoes',
    label: 'Configurações',
    sections: [
      {
        id:    'dados-empresa',
        title: 'Dados da Empresa',
        content: 'Preencha os dados da sua empresa para que apareçam no cabeçalho do DANFE.',
        images: [
          { file: 'help-09-settings-empresa.png', alt: 'Configurações de dados da empresa' },
        ],
        tips: [
          {
            type:    'info',
            content: `
              Os dados são salvos automaticamente no navegador.
              Não é necessário preencher toda vez que acessar o DanfeGen.
            `,
          },
        ],
      },
      {
        id:    'identidade-visual',
        title: 'Identidade Visual',
        content: 'Personalize o DANFE com a logo e as cores da sua empresa.',
        steps: [
          {
            title:   'Upload da Logo',
            content: 'Clique em Escolher Logo e selecione um arquivo PNG, JPG ou SVG com até 512 KB.',
          },
          {
            title:   'Posição da Logo',
            content: 'Escolha se a logo aparece à esquerda, centralizada ou à direita no cabeçalho.',
          },
          {
            title:   'Cor Primária',
            content: 'Clique no seletor de cor para definir a cor dos blocos e cabeçalhos do DANFE.',
          },
        ],
        images: [
          { file: 'help-10-settings-logo.png', alt: 'Upload de logo e configuração visual' },
          { file: 'help-11-settings-cor.png',  alt: 'Seletor de cor primária'              },
        ],
      },
      {
        id:    'backup',
        title: 'Backup e Restauração',
        content: 'Exporte suas configurações para um arquivo JSON e restaure em outro dispositivo.',
        steps: [
          {
            title:   'Exportar configurações',
            content: `
              Clique em Exportar JSON. Um arquivo de backup será baixado
              com todas as suas configurações (dados da empresa, logo, cores e e-mail).
            `,
          },
          {
            title:   'Importar configurações',
            content: `
              Clique em Importar JSON e selecione o arquivo de backup.
              Todas as configurações serão restauradas automaticamente.
            `,
          },
        ],
        tips: [
          {
            type:    'success',
            content: `
              Trocou de computador? Use Exportar JSON no computador antigo
              e Importar JSON no novo para transferir todas as configurações.
            `,
          },
        ],
      },
    ],
  },

  /* ── 7. ERP ──────────────────────────────────────────────── */
  {
    id:    'erp',
    label: 'ERP',
    sections: [
      {
        id:    'integracao-erp',
        title: 'Integração com ERP',
        content: `
          O DanfeGen pode receber XMLs automaticamente do seu sistema ERP via webhook,
          sem precisar fazer upload manualmente. Configure uma vez e use para sempre.
        `,
        steps: [
          {
            title:   'Abra as Configurações',
            content: 'Clique no ícone ⚙️ no canto superior direito.',
          },
          {
            title:   'Selecione seu ERP',
            content: 'Na seção Integração ERP, escolha o sistema que você usa na lista.',
          },
          {
            title:   'Copie a URL do Webhook',
            content: `
              Uma URL será gerada automaticamente.
              Copie essa URL e cole no painel do seu ERP,
              na seção de integrações ou webhooks.
            `,
          },
          {
            title:   'Teste a integração',
            content: `
              Emita uma NF-e pelo ERP e verifique se o XML chega automaticamente
              no DanfeGen e o DANFE é gerado.
            `,
          },
        ],
        images: [
          { file: 'help-13-settings-erp.png', alt: 'Configuração de integração ERP' },
        ],
        tips: [
          {
            type:    'info',
            content: `
              Não encontrou seu ERP na lista? Entre em contato pelo GitHub
              — novas integrações são adicionadas com frequência.
            `,
          },
        ],
      },
      {
        id:    'erps-suportados',
        title: 'ERPs suportados',
        content: 'Veja onde configurar o webhook em cada sistema:',
      },
    ],
  },
]

/* ─── ERPs suportados (tabela separada para reuso) ──────────── */
export const HELP_ERPS = [
  {
    name:     'Bling',
    path:     'Configurações → Integrações → Webhooks',
    docsUrl:  'https://developer.bling.com.br',
  },
  {
    name:     'Omie',
    path:     'Configurações → Integrações → API / Webhook',
    docsUrl:  'https://developer.omie.com.br',
  },
  {
    name:     'Tiny ERP',
    path:     'Preferências → Integrações → Webhook NF-e',
    docsUrl:  'https://erp.tiny.com.br/ajuda',
  },
  {
    name:     'Conta Azul',
    path:     'Configurações → Integrações → Webhook',
    docsUrl:  'https://desenvolvedor.contaazul.com',
  },
  {
    name:     'TOTVS Protheus',
    path:     'Módulo SIGAFIS → Parâmetros → Webhook NF-e',
    docsUrl:  'https://tdn.totvs.com',
  },
]

/* ─── FAQ ────────────────────────────────────────────────────── */
export const HELP_FAQ: HelpFAQItem[] = [
  {
    question: 'O DanfeGen envia meus XMLs para algum servidor?',
    answer: `
      Não. Todo o processamento acontece diretamente no seu navegador.
      Nenhum arquivo XML, dado da empresa ou informação fiscal trafega pela internet.
      A única exceção é o envio por e-mail, que usa a API Resend — e apenas o PDF
      gerado é enviado, nunca o XML original.
    `,
  },
  {
    question: 'Qual o tamanho máximo de arquivo aceito?',
    answer: `
      Para XML individual: até 1 MB (o suficiente para qualquer NF-e válida).
      Para arquivo ZIP (lote): até 50 MB comprimido e 50 MB descomprimido.
      O sistema rejeita ZIPs que excedam esses limites por segurança.
    `,
  },
  {
    question: 'Quantos XMLs posso processar de uma vez?',
    answer: `
      Em lote via ZIP, é possível processar até 10 NF-es por vez.
      Para volumes maiores, divida os XMLs em grupos de 10
      e processe cada grupo separadamente.
    `,
  },
  {
    question: 'O DANFE gerado tem validade jurídica?',
    answer: `
      O DANFE gerado pelo DanfeGen é uma representação gráfica da NF-e para uso auxiliar.
      O documento com validade jurídica é a própria NF-e eletrônica autorizada pela SEFAZ.
      Para fins fiscais e legais, sempre mantenha o XML original.
    `,
  },
  {
    question: 'Minha impressora térmica não imprime no tamanho certo. O que fazer?',
    answer: `
      Verifique se: (1) a aba Etiqueta 80mm está selecionada antes de imprimir,
      (2) o tamanho do papel está configurado como 80mm × contínuo no driver da impressora,
      (3) as margens estão em Nenhuma e a escala em 100% no diálogo de impressão.
    `,
  },
  {
    question: 'Posso usar o DanfeGen no celular?',
    answer: `
      Sim. O DanfeGen é responsivo e funciona em dispositivos móveis.
      No celular, o botão Compartilhar abre o menu nativo do sistema,
      permitindo enviar o DANFE pelo WhatsApp, Telegram ou e-mail diretamente.
    `,
  },
  {
    question: 'Como faço para que minha logo apareça no DANFE?',
    answer: `
      Acesse Configurações → Identidade Visual → Upload de Logo.
      Selecione um arquivo PNG, JPG ou SVG com até 512 KB.
      A logo aparecerá automaticamente em todos os DANFEs gerados.
      Você pode escolher a posição (esquerda, centro ou direita) e a cor primária do documento.
    `,
  },
  {
    question: 'O e-mail não está sendo enviado. O que pode ser?',
    answer: `
      Verifique se: (1) o toggle de envio por e-mail está ativado nas Configurações,
      (2) o domínio do e-mail remetente está verificado no painel do Resend,
      (3) a variável RESEND_API_KEY está configurada corretamente na Vercel.
      Gmail, Hotmail e Yahoo não podem ser usados como remetente.
    `,
  },
  {
    question: 'Preciso instalar alguma coisa para usar o DanfeGen?',
    answer: `
      Não. O DanfeGen é um Progressive Web App (PWA) que roda diretamente no navegador.
      Se quiser, pode instalar como app no desktop ou celular clicando em
      "Instalar" no endereço do navegador — funciona offline para os recursos básicos.
    `,
  },
  {
    question: 'Minhas configurações somem quando fecho o navegador. Por quê?',
    answer: `
      As configurações são salvas no localStorage do navegador.
      Isso pode acontecer se você usar modo anônimo, limpar o histórico
      ou usar um navegador diferente. Use a função Exportar JSON para
      fazer backup das configurações e importar quando necessário.
    `,
  },
]