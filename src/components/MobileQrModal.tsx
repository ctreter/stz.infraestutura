import { Check, Copy, Download, Smartphone, X } from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

interface MobileQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHARED_APP_URL = 'https://ais-pre-cq5iah6ksonzmbxkjxaayl-858612417262.us-east1.run.app';
const DEV_APP_URL = 'https://ais-dev-cq5iah6ksonzmbxkjxaayl-858612417262.us-east1.run.app';

type UrlMode = 'shared' | 'dev';

export function MobileQrModal({ isOpen, onClose }: MobileQrModalProps) {
  const [mode, setMode] = useState<UrlMode>('shared');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const currentOrigin =
    typeof window !== 'undefined' &&
    window.location.origin &&
    !window.location.origin.includes('localhost')
      ? window.location.origin
      : DEV_APP_URL;

  const targetUrl = mode === 'shared' ? SHARED_APP_URL : currentOrigin;

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    QRCode.toDataURL(targetUrl, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Erro ao gerar QR Code:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, targetUrl]);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2500);
    return () => window.clearTimeout(t);
  }, [copied]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
    } catch {
      // Fallback silencioso se clipboard API estiver bloqueada
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `stz-areas-consolidadas-qr-${mode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-blue-700" aria-hidden="true" />
            <h2 id="qr-modal-title" className="text-base font-bold text-slate-900">
              Testar no Celular (QR Code)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela de QR Code"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Alternância entre URL compartilhada e URL de desenvolvimento */}
          <div className="flex items-center p-1 bg-slate-100 rounded-md">
            <button
              type="button"
              onClick={() => setMode('shared')}
              className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                mode === 'shared'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Link Compartilhado (Recomendado)
            </button>
            <button
              type="button"
              onClick={() => setMode('dev')}
              className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                mode === 'dev'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Link de Desenvolvimento
            </button>
          </div>

          {/* Quadro do QR Code */}
          <div className="flex flex-col items-center justify-center p-5 bg-slate-50 border border-slate-200 rounded-lg">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Code de acesso ao aplicativo STZ ENGENHARIA E MANUTENÇÃO (${targetUrl})`}
                className="w-56 h-56 bg-white p-2 border border-slate-200 rounded"
              />
            ) : (
              <div className="w-56 h-56 bg-white border border-slate-200 rounded animate-pulse" />
            )}
            <p className="mt-3 text-xs text-slate-600 text-center">
              Aponte a câmera do celular para abrir o aplicativo diretamente no navegador móvel.
            </p>
          </div>

          {/* URL em texto copiável */}
          <div className="space-y-1.5">
            <span className="block text-[11px] font-medium text-slate-500">
              Endereço codificado
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={targetUrl}
                aria-label="URL codificada no QR Code"
                className="flex-1 h-9 px-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-md text-slate-700 select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="text-emerald-700">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={!qrDataUrl}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar PNG</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors cursor-pointer"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
