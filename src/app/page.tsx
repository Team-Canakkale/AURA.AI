'use client';

import { useState } from 'react';
import { Phone, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | null }>({
    message: '',
    type: null,
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 5000);
  };

  const handleCall = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/call', { method: 'POST' });
      const data = await response.json();

      if (response.ok) {
        showToast('AURA sana ulaşmak üzere! 🚀', 'success');
      } else {
        showToast(data.error || 'Arama başarısız oldu.', 'error');
      }
    } catch (error) {
      showToast('Bir ağ hatası oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <div className="background-glow">
        <div className="glow-orb" style={{ top: '10%', left: '10%' }}></div>
        <div className="glow-orb" style={{ bottom: '10%', right: '10%', animationDelay: '-10s' }}></div>
      </div>

      <div className="container">
        <div className="status-badge">
          <div className="status-dot"></div>
          AURA-Aİ ÇEVRİMİÇİ
        </div>

        <h1>Kurtarıcı Modu</h1>
        <p>AURA seni hemen arayacak ve sohbete başlayacak. Tek yapman gereken aşağıdaki butona dokunmak.</p>

        <button
          className="call-button"
          onClick={handleCall}
          disabled={loading}
        >
          <div className="pulse-ring"></div>
          {loading ? (
            <Loader2 className="animate-spin" size={32} />
          ) : (
            <>
              <Phone size={32} fill="currentColor" />
              <span>BENİ ARA</span>
            </>
          )}
        </button>
      </div>

      <div className={`toast ${toast.type ? 'show' : ''} ${toast.type || ''}`}>
        {toast.type === 'success' && <CheckCircle2 size={20} />}
        {toast.type === 'error' && <AlertCircle size={20} />}
        <span>{toast.message}</span>
      </div>
    </main>
  );
}
