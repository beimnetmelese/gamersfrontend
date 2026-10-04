import React from 'react';
import { PRESET_TEST_TELEGRAM_USERS, getLocalFallbackTelegramUser, setLocalFallbackTelegramUser, APP_MODE } from '../config/telegram';

interface Props {
  activeTelegramId: string;
  onSwitchTelegramUser: (newId: string) => void;
}

export const TelegramDevBanner: React.FC<Props> = ({ activeTelegramId, onSwitchTelegramUser }) => {
  // Only show if outside real Telegram Mini App or in local testing fallback
  const isRealTelegram = !!(window.Telegram?.WebApp?.initDataUnsafe?.user);
  if (isRealTelegram && APP_MODE === 'live') return null;

  const currentUser = PRESET_TEST_TELEGRAM_USERS.find(u => u.id === activeTelegramId) || getLocalFallbackTelegramUser();

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setLocalFallbackTelegramUser(selectedId);
    onSwitchTelegramUser(selectedId);
  };

  return (
    <div style={{
      background: 'linear-gradient(90deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
      color: '#ffffff',
      padding: '8px 16px',
      fontSize: '0.85rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '8px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      zIndex: 9999
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
        <span style={{ fontSize: '1rem' }}>📱</span>
        <span>Telegram Mini App Sandbox Mode:</span>
        <span style={{
          background: APP_MODE === 'test' ? 'rgba(234, 179, 8, 0.25)' : 'rgba(34, 197, 94, 0.25)',
          color: APP_MODE === 'test' ? '#fef08a' : '#86efac',
          border: APP_MODE === 'test' ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid rgba(34, 197, 94, 0.4)',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          letterSpacing: '0.5px'
        }}>
          APP_MODE={APP_MODE.toUpperCase()}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ opacity: 0.9 }}>Active Test User:</span>
        <select
          value={currentUser.id}
          onChange={handleSelect}
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '0.82rem',
            fontWeight: 500,
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          {PRESET_TEST_TELEGRAM_USERS.map(u => (
            <option key={u.id} value={u.id} style={{ background: '#1e1b4b', color: '#fff' }}>
              [{u.roleLabel}] {u.first_name} (@{u.username}) - ID: {u.id}
            </option>
          ))}
        </select>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
          title="Reload app with selected user"
        >
          🔄 Refresh Auth
        </button>
      </div>
    </div>
  );
};
