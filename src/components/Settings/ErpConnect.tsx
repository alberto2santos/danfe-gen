import { useState }          from 'react'
import { Plug, Wifi, WifiOff } from 'lucide-react'
import { useCompany }        from '@/contexts/CompanyContext'
import { useErpConnection }  from '@/hooks/useErpConnection'
import { Button }            from '@/components/UI/Button'
import { Alert }             from '@/components/UI/Alert'

export function ErpConnect() {
  const { config }                          = useCompany()
  const { status, message, testConnection } = useErpConnection()
  const [testing, setTesting]               = useState(false)

  const handleTest = async () => {
    setTesting(true)
    await testConnection(config.erpProvider, config.erpWebhookUrl)
    setTesting(false)
  }

  if (config.erpProvider === 'none') return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Plug size={14} className="text-brand-600 dark:text-brand-400" />
        <span className="text-xs font-semibold uppercase tracking-wide text-surface-500">
          Conexão ERP
        </span>
      </div>

      {status === 'connected' && (
        <Alert variant="success">
          <div className="flex items-center gap-2">
            <Wifi size={14} />
            <span>{message}</span>
          </div>
        </Alert>
      )}

      {status === 'error' && (
        <Alert variant="danger">
          <div className="flex items-center gap-2">
            <WifiOff size={14} />
            <span>{message}</span>
          </div>
        </Alert>
      )}

      <Button
        variant="secondary"
        size="sm"
        loading={testing}
        onClick={handleTest}
        disabled={!config.erpWebhookUrl}
      >
        Testar conexão
      </Button>
    </div>
  )
}