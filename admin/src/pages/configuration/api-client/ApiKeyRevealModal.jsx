import { useState } from "react";
import { Copy, Check, AlertTriangle } from "lucide-react";
import Modal from "../../../components/Modal";

// Shown once after an API key is created or regenerated. The key is never retrievable again.
export default function ApiKeyRevealModal({ apiKey, title = "API Key Generated", onClose }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = apiKey;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
        >
          I’ve saved the key
        </button>
      }
    >
      <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2.5 mb-4">
        <AlertTriangle size={16} className="text-warning shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          Copy this key now and store it securely. For security reasons it will <b>not</b> be shown again.
        </p>
      </div>
      <p className="text-xs font-medium text-gray-600 mb-1.5">API Key</p>
      <div className="flex items-stretch gap-2">
        <code className="flex-1 min-w-0 px-3 py-2.5 text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg break-all text-gray-800">
          {apiKey}
        </code>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 flex items-center gap-1.5 px-3 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700"
        >
          {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </Modal>
  );
}
