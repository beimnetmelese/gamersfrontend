import { getLocalFallbackTelegramUser, type TestTelegramUser } from '../config/telegram';

export interface TelegramAuthPayload {
  initData: string;
  telegram_id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  isFallback: boolean;
}

export const getTelegramAuthPayload = (): TelegramAuthPayload => {
  const tg = window.Telegram?.WebApp;
  if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    const u = tg.initDataUnsafe.user;
    return {
      initData: tg.initData || '',
      telegram_id: String(u.id),
      username: u.username || '',
      first_name: u.first_name || '',
      last_name: u.last_name || '',
      photo_url: u.photo_url || '',
      isFallback: false
    };
  }

  // Local Browser Sandbox Fallback
  const fallback: TestTelegramUser = getLocalFallbackTelegramUser();
  return {
    initData: '',
    telegram_id: fallback.id,
    username: fallback.username,
    first_name: fallback.first_name,
    isFallback: true
  };
};

export const initTelegramSDK = () => {
  try {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  } catch (e) {
    console.warn('Telegram SDK initialization failed/bypassed:', e);
  }
};
