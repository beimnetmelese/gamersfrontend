export interface TestTelegramUser {
  id: string;
  username: string;
  first_name: string;
  roleLabel: string;
}

// Application Mode: 'test' | 'live' (set via VITE_APP_MODE in env, defaults to 'test')
export const APP_MODE: 'test' | 'live' = (import.meta.env.VITE_APP_MODE || 'test').toString().toLowerCase() === 'live' ? 'live' : 'test';

export const PRESET_TEST_TELEGRAM_USERS: TestTelegramUser[] = [
  { id: '1166925225', username: 'admin_bewnet', first_name: 'Bewnet (Admin)', roleLabel: 'ADMIN' },
  { id: '8805304789', username: 'player_ethiopia', first_name: 'Abebe (Player)', roleLabel: 'PLAYER' },
  { id: '9988776655', username: 'seller_store', first_name: 'Addis Tech (Seller)', roleLabel: 'SELLER' },
];

export const DEFAULT_TEST_TELEGRAM_ID = PRESET_TEST_TELEGRAM_USERS[0].id;

export const getLocalFallbackTelegramUser = (): TestTelegramUser => {
  const storedId = localStorage.getItem('addisgigs_dev_telegram_id');
  if (storedId) {
    const matched = PRESET_TEST_TELEGRAM_USERS.find(u => u.id === storedId);
    if (matched) return matched;
    return { id: storedId, username: `dev_${storedId}`, first_name: `Dev User ${storedId}`, roleLabel: 'DEV' };
  }
  return PRESET_TEST_TELEGRAM_USERS[0];
};

export const setLocalFallbackTelegramUser = (id: string) => {
  localStorage.setItem('addisgigs_dev_telegram_id', id);
};
