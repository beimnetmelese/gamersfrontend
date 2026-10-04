import type {
  Game, Product, Wallet, Category, WinnerRecord, GameFilterState,
  GameStatisticsData, User, UserStats, Favorite, Notification,
  PaymentSubmission, WithdrawalRequest, UserAdminRecord, HistoryRecord,
  ProductDelivery, SellerRating, Report, PlatformSetting, SellerStats,
  AdminPlatformAnalytics, Seller
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('allin_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  return headers;
};

const getAuthMultipartHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('allin_auth_token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }
  return headers;
};

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'Phones', slug: 'phones', icon: 'smartphone', description: 'Smartphones, iPhones, and mobile devices', gameCount: 14 },
  { id: 2, name: 'Laptops', slug: 'laptops', icon: 'laptop', description: 'MacBooks, gaming laptops, and ultrabooks', gameCount: 9 },
  { id: 3, name: 'Gaming', slug: 'gaming', icon: 'gamepad-2', description: 'PS5, Xbox, Nintendo Switch, and gaming rigs', gameCount: 18 },
  { id: 4, name: 'Electronics', slug: 'electronics', icon: 'tv', description: 'Smart TVs, cameras, drone, and home gadgets', gameCount: 12 },
  { id: 5, name: 'Fashion', slug: 'fashion', icon: 'shirt', description: 'Luxury watches, sneakers, and designer wear', gameCount: 8 },
  { id: 6, name: 'Home', slug: 'home', icon: 'home', description: 'Smart home automation, appliances, and decor', gameCount: 6 },
  { id: 7, name: 'Vehicles', slug: 'vehicles', icon: 'car', description: 'Electric scooters, motorbikes, and auto gear', gameCount: 5 },
  { id: 8, name: 'Other', slug: 'other', icon: 'package', description: 'Gift cards, vouchers, collectibles, and novelty items', gameCount: 7 },
];

export const extractErrorMessage = (data: any, defaultMsg: string = 'Operation failed'): string => {
  if (!data) return defaultMsg;
  if (typeof data === 'string') return data;
  if (data.error && typeof data.error === 'string') return data.error;
  if (data.detail && typeof data.detail === 'string') return data.detail;
  if (data.message && typeof data.message === 'string') return data.message;
  if (typeof data === 'object') {
    const messages: string[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (key === 'success') continue;
      const fieldName = key.replace(/_/g, ' ');
      if (Array.isArray(value)) {
        messages.push(`${fieldName}: ${value.join(', ')}`);
      } else if (typeof value === 'string') {
        messages.push(`${fieldName}: ${value}`);
      } else if (typeof value === 'object' && value !== null) {
        messages.push(`${fieldName}: ${JSON.stringify(value)}`);
      }
    }
    if (messages.length > 0) return messages.join(' | ');
  }
  return defaultMsg;
};

export const normalizeProduct = (raw: any): Product => {
  if (!raw) {
    return {
      id: 1,
      title: 'Product Item',
      category: 'Electronics',
      description: 'Standard product description',
      imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80',
      condition: 'NEW',
      estimatedValue: 50000,
      location: 'Addis Ababa',
      approvalStatus: 'APPROVED'
    };
  }
  return {
    id: raw.id || 1,
    title: raw.title || 'Product',
    category: raw.category || 'Electronics',
    description: raw.description || '',
    imageUrl: raw.image_url || raw.imageUrl || 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80',
    condition: raw.condition || 'NEW',
    estimatedValue: typeof raw.estimated_value === 'string' ? parseFloat(raw.estimated_value) : (raw.estimated_value || raw.estimatedValue || 0),
    location: raw.location || 'Addis Ababa',
    approvalStatus: raw.approval_status || raw.approvalStatus || 'APPROVED'
  };
};

export const normalizeGame = (raw: any): Game => {
  const prodRaw = raw.product_details || raw.product || {};
  return {
    id: raw.id,
    product: normalizeProduct(prodRaw),
    sellerName: raw.seller_name || raw.sellerName || 'Addis Tech Hub',
    title: raw.title || 'Game Challenge',
    gameType: raw.game_type || raw.gameType || 'TREASURE_BOX',
    entryFee: typeof raw.entry_fee === 'string' ? parseFloat(raw.entry_fee) : (raw.entry_fee || raw.entryFee || 0),
    maxParticipants: parseInt(raw.max_participants || raw.maxParticipants || 100),
    participantsCount: parseInt(raw.participants_count || raw.participantsCount || 0),
    totalBoxes: Math.max(parseInt(raw.total_boxes || raw.totalBoxes || 0), 100),
    durationMinutes: raw.duration_minutes || raw.durationMinutes || 120,
    rulesDescription: raw.rules_description || raw.rulesDescription || 'Standard rules',
    status: raw.status || 'ACTIVE',
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    isFeatured: raw.is_featured ?? raw.isFeatured ?? false,
    isRecommended: raw.is_recommended ?? raw.isRecommended ?? false,
    isFavorited: raw.is_favorited ?? raw.isFavorited ?? false,
    viewsCount: parseInt(raw.views_count || raw.viewsCount || 0),
    questionPrompt: raw.question_prompt || raw.questionPrompt,
    targetTimeSec: parseFloat(raw.target_time_sec || raw.targetTimeSec || 10.000),
    winnerName: raw.winner_name || raw.winnerName,
    winningValue: raw.winning_value || raw.winningValue,
    participants: (raw.participants || []).map((p: any) => ({
      id: p.id,
      gameId: p.game || p.gameId,
      userId: p.user || p.userId,
      username: p.username || 'Participant',
      selectedBox: p.selected_box ?? p.selectedBox,
      selectedNumber: p.selected_number ?? p.selectedNumber,
      selectedCard: p.selected_card ?? p.selectedCard,
      timerDeltaMs: p.timer_delta_ms ?? p.timerDeltaMs,
      joinedAt: p.joined_at || p.joinedAt || new Date().toISOString()
    })),
    rejectionReason: raw.rejection_reason || raw.rejectionReason || ''
  };
};

export const telegramAuthAPI = async (payload: {
  initData?: string;
  telegram_id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
}): Promise<{ success: boolean; message: string; user?: User; wallet?: Wallet; token?: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/telegram/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok) {
      if (data.token) localStorage.setItem('allin_auth_token', data.token);
      if (data.user) localStorage.setItem('allin_auth_user', JSON.stringify(data.user));
      return { success: true, message: data.message || 'Telegram login successful.', user: data.user, wallet: data.wallet, token: data.token };
    }
    return { success: false, message: data.error || 'Telegram authentication failed.' };
  } catch (err) {
    return { success: false, message: 'Network error connecting to backend.' };
  }
};

export const loginUserAPI = async (usernameOrEmail: string, password: string): Promise<{ success: boolean; message: string; user?: User; wallet?: Wallet; token?: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username_or_email: usernameOrEmail, password })
    });
    const data = await res.json();
    if (res.ok) {
      if (data.token) localStorage.setItem('allin_auth_token', data.token);
      localStorage.setItem('allin_auth_user', JSON.stringify(data.user));
      return { success: true, message: data.message, user: data.user, wallet: data.wallet, token: data.token };
    }
    return { success: false, message: data.error || 'Login failed.' };
  } catch (err) {
    return { success: false, message: 'Network error connecting to backend.' };
  }
};

export const registerUserAPI = async (username: string, email: string, password: string, role: string = 'USER'): Promise<{ success: boolean; message: string; user?: User; wallet?: Wallet; token?: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role })
    });
    const data = await res.json();
    if (res.ok) {
      if (data.token) localStorage.setItem('allin_auth_token', data.token);
      localStorage.setItem('allin_auth_user', JSON.stringify(data.user));
      return { success: true, message: data.message, user: data.user, wallet: data.wallet, token: data.token };
    }
    return { success: false, message: data.error || 'Registration failed.' };
  } catch (err) {
    return { success: false, message: 'Network error connecting to backend.' };
  }
};

export const logoutUserAPI = async (): Promise<boolean> => {
  try {
    await fetch(`${API_BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch (e) {}
  localStorage.removeItem('allin_auth_token');
  localStorage.removeItem('allin_auth_user');
  return true;
};

// --- USER PROFILE & SETTINGS APIS ---

export const fetchUserProfileAPI = async (): Promise<User | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/profiles/me/`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      const uData = data.user || {};
      return {
        id: data.id,
        username: uData.username || data.username || '',
        email: uData.email || data.email || '',
        firstName: uData.first_name || data.first_name || data.telegram_first_name || '',
        lastName: uData.last_name || data.last_name || '',
        role: uData.role || data.role || 'USER',
        accountStatus: uData.account_status || data.account_status || 'ACTIVE',
        phoneNumber: data.phone_number || '',
        bio: data.bio || '',
        avatarUrl: data.avatar_url || '',
        notificationPreferences: data.notification_preferences || {},
        privacySettings: data.privacy_settings || {},
        language: data.language || 'en'
      };
    }
  } catch (e) {}
  return null;
};

export const updateUserProfileAPI = async (profileData: Partial<User>): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/profiles/me/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        username: profileData.username,
        first_name: profileData.firstName || profileData.first_name,
        last_name: profileData.lastName || profileData.last_name,
        email: profileData.email,
        bio: profileData.bio,
        avatar_url: profileData.avatarUrl,
        phone_number: profileData.phoneNumber,
        notification_preferences: profileData.notificationPreferences,
        privacy_settings: profileData.privacySettings,
        language: profileData.language
      })
    });
    if (res.ok) return { success: true, message: "Profile updated successfully!" };
    const err = await res.json();
    return { success: false, message: err.error || err.detail || "Failed to update profile." };
  } catch (e) {
    return { success: false, message: "Network error updating profile." };
  }
};

export const changePasswordAPI = async (oldPassword: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/change_password/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword, confirm_password: confirmPassword })
    });
    const data = await res.json();
    if (res.ok) return { success: true, message: data.message || "Password changed successfully!" };
    return { success: false, message: data.error || "Failed to change password." };
  } catch (e) {
    return { success: false, message: "Network error changing password." };
  }
};

export const applySellerAPI = async (businessName: string, phoneNumber: string, address: string, description: string = ''): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/sellers/apply/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ business_name: businessName, phone_number: phoneNumber, address, description })
    });
    const data = await res.json();
    if (res.ok) return { success: true, message: data.message || "Seller application submitted! Pending Admin verification." };
    return { success: false, message: data.error || "Failed to submit seller application." };
  } catch (e) {
    return { success: false, message: "Network error submitting seller application." };
  }
};

export const approveAdminSellerAPI = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/sellers/${id}/approve/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (res.ok) return { success: true, message: data.message };
    return { success: false, message: data.error || "Failed to approve seller application." };
  } catch (e) {
    return { success: false, message: "Network error approving seller." };
  }
};

export const rejectAdminSellerAPI = async (id: number, reason: string = 'Rejected'): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/sellers/${id}/reject/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    const data = await res.json();
    if (res.ok) return { success: true, message: data.message };
    return { success: false, message: data.error || "Failed to reject seller application." };
  } catch (e) {
    return { success: false, message: "Network error rejecting seller." };
  }
};


export const fetchUserStatsAPI = async (): Promise<UserStats> => {
  try {
    const res = await fetch(`${API_BASE_URL}/profiles/me/stats/`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      return {
        gamesPlayed: data.games_played || 0,
        gamesWon: data.games_won || 0,
        gamesLost: data.games_lost || 0,
        winRate: data.win_rate || 0.0,
        totalEntries: data.total_entries || 0,
        totalSpent: data.total_spent || 0.0
      };
    }
  } catch (e) {}
  return { gamesPlayed: 0, gamesWon: 0, gamesLost: 0, winRate: 0.0, totalEntries: 0, totalSpent: 0.0 };
};

// --- MY GAMES & GAME APIS ---

export const fetchGames = async (page: number = 1): Promise<Game[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/games/?page=${page}&page_size=30`);
    if (res.ok) {
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : (data.results || []);
      return rawList.map(normalizeGame);
    }
  } catch (err) {}
  return [];
};

export const fetchMyGamesAPI = async (statusFilter: string = 'ALL'): Promise<Game[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/games/my_games/?status=${statusFilter}`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      return data.map(normalizeGame);
    }
  } catch (e) {}
  return [];
};

export const joinGameAPI = async (gameId: number, selectionData: Record<string, any>): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/games/${gameId}/join_game/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(selectionData)
    });
    const data = await res.json();
    if (res.ok) {
      window.dispatchEvent(new Event('allin_wallet_updated'));
      return { success: true, message: data.message || "Joined game successfully!" };
    }
    return { success: false, message: data.error || 'Failed to join game.' };
  } catch (err) {
    return { success: false, message: 'Network error trying to join game.' };
  }
};

export const createGameAPI = async (newGame: Partial<Game>): Promise<Game | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/games/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(newGame)
    });
    if (res.ok) {
      const data = await res.json();
      return normalizeGame(data);
    }
  } catch (err) {}
  return null;
};

export const updateGameAPI = async (gameId: number, updatedGame: Partial<Game>): Promise<Game | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/games/${gameId}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...updatedGame, status: 'PENDING_APPROVAL', rejection_reason: '' })
    });
    if (res.ok) {
      const data = await res.json();
      return normalizeGame(data);
    }
  } catch (err) {}
  return null;
};

export const resolveGameAPI = async (gameId: number): Promise<{ success: boolean; winner?: string; details?: string; message?: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/games/${gameId}/resolve_game/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (res.ok) return await res.json();
    const data = await res.json();
    return { success: false, message: data.error || "Failed to resolve game." };
  } catch (e) {
    return { success: false, message: "Network error resolving game." };
  }
};

// --- FAVORITES APIS ---

export const fetchFavoritesAPI = async (): Promise<Favorite[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/favorites/`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : (data.results || []);
      return rawList.map((f: any) => ({
        id: f.id,
        gameId: f.game,
        gameTitle: f.game_title,
        productImage: f.product_image,
        entryFee: parseFloat(f.entry_fee || 0),
        gameType: f.game_type,
        status: f.status,
        createdAt: f.created_at
      }));
    }
  } catch (e) {}
  return [];
};

export const toggleFavoriteAPI = async (gameId: number): Promise<{ success: boolean; isFavorited?: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/favorites/toggle/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ game_id: gameId })
    });
    const data = await res.json();
    if (res.ok) return { success: true, isFavorited: data.is_favorited, message: data.message };
    return { success: false, message: data.error || 'Failed to update favorite.' };
  } catch (e) {
    return { success: false, message: 'Network error updating favorite.' };
  }
};

// --- NOTIFICATIONS APIS ---

export const fetchNotificationsAPI = async (): Promise<Notification[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : (data.results || []);
      return rawList.map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        eventType: n.event_type || n.eventType,
        isRead: n.is_read ?? n.isRead,
        createdAt: n.created_at || n.createdAt
      }));
    }
  } catch (e) {}
  return [];
};

export const markNotificationReadAPI = async (id: number): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}/mark_read/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.ok;
  } catch (e) {}
  return false;
};

export const markAllNotificationsReadAPI = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/mark_all_read/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.ok;
  } catch (e) {}
  return false;
};

// --- WALLET, DEPOSIT & WITHDRAWAL APIS ---

export const fetchWallet = async (): Promise<Wallet> => {
  try {
    const res = await fetch(`${API_BASE_URL}/wallets/me/`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      const bal = parseFloat(data.balance || 0);
      const resBal = parseFloat(data.reserved_balance || 0);
      const avail = parseFloat(data.available_balance || (bal - resBal));

      return {
        balance: bal,
        reservedBalance: resBal,
        availableBalance: avail,
        transactions: (data.transactions || []).map((t: any) => ({
          id: t.id,
          transactionType: t.transaction_type || t.transactionType,
          direction: t.direction,
          status: t.status,
          amount: parseFloat(t.amount),
          referenceId: t.reference_id || t.referenceId,
          note: t.note,
          createdAt: t.created_at || t.createdAt
        }))
      };
    }
  } catch (err) {}

  return { balance: 0, reservedBalance: 0, availableBalance: 0, transactions: [] };
};

export const fetchUserHistoryAPI = async (): Promise<HistoryRecord[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/wallets/history/`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      const records: HistoryRecord[] = [];

      (data.transactions || []).forEach((t: any) => {
        const isRejected = t.status === 'REJECTED' || t.status === 'CANCELLED';
        records.push({
          id: `TX-${t.id}`,
          date: t.created_at,
          type: t.transaction_type,
          title: t.note || `${t.transaction_type} Ledger Entry`,
          amount: isRejected ? 0 : Math.abs(parseFloat(t.amount)),
          direction: isRejected ? 'CREDIT' : (t.direction || (t.amount >= 0 ? 'CREDIT' : 'DEBIT')),
          status: t.status || 'COMPLETED',
          referenceId: t.reference_id || `#${t.id}`,
          details: `Ledger Record: ${t.note}`
        });
      });

      return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  } catch (e) {}
  return [];
};

export const submitPaymentDepositAPI = async (data: { paymentMethod: string; bank: string; transactionId: string; amount: number }): Promise<{ success: boolean; verified?: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        payment_method: data.paymentMethod,
        bank: data.bank,
        transaction_id: data.transactionId,
        amount: data.amount
      })
    });
    const resData = await res.json();
    if (res.ok && resData.success && resData.verified) {
      window.dispatchEvent(new Event('allin_wallet_updated'));
      return { success: true, verified: true, message: resData.message || "Verification successful! Your wallet balance has been updated." };
    }
    return {
      success: false,
      verified: false,
      message: resData.message || resData.error || "Invalid transaction ID for the selected bank. Please double-check your receipt."
    };
  } catch (err) {
    return { success: false, verified: false, message: "Network error processing payment verification." };
  }
};

export const submitPaymentProof = async (formData: FormData): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/`, {
      method: 'POST',
      headers: getAuthMultipartHeaders(),
      body: formData
    });
    const data = await res.json();
    if (res.ok) {
      window.dispatchEvent(new Event('allin_wallet_updated'));
      return { success: true, message: data.message || "Deposit proof submitted! Pending Admin verification." };
    }
    return { success: false, message: data.error || "Deposit submission failed." };
  } catch (err) {
    return { success: false, message: "Network error submitting deposit proof." };
  }
};

export const submitWithdrawalRequestAPI = async (data: { withdrawalMethod: string; accountNumber: string; accountName?: string; phoneNumber?: string; amount: number }): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/withdrawals/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        withdrawal_method: data.withdrawalMethod,
        account_number: data.accountNumber,
        account_name: data.accountName,
        phone_number: data.phoneNumber,
        amount: data.amount
      })
    });
    const resData = await res.json();
    if (res.ok) {
      window.dispatchEvent(new Event('allin_wallet_updated'));
      return { success: true, message: resData.message || "Withdrawal request submitted! Funds reserved pending admin payout." };
    }
    return { success: false, message: resData.error || "Withdrawal request failed." };
  } catch (err) {
    return { success: false, message: "Network error creating withdrawal request." };
  }
};

// --- ADMIN MANAGEMENT APIS ---

export const fetchAdminDepositsAPI = async (statusFilter: string = 'ALL'): Promise<PaymentSubmission[]> => {
  try {
    const query = statusFilter && statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
    const res = await fetch(`${API_BASE_URL}/payments/${query}`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : (data.results || []);
      return rawList.map((p: any) => ({
        id: p.id,
        userId: p.user,
        username: p.username || 'User',
        userEmail: p.user_email,
        userPhone: p.user_phone,
        walletBalance: p.wallet_balance ? parseFloat(p.wallet_balance) : 0,
        bank: p.bank || 'cbe',
        paymentMethod: p.payment_method,
        transactionId: p.transaction_id,
        amount: parseFloat(p.amount),
        proofImageUrl: p.proof_image ? (p.proof_image.startsWith('http') ? p.proof_image : `http://localhost:8000${p.proof_image}`) : undefined,
        status: p.status,
        adminNote: p.admin_note,
        submittedAt: p.submitted_at,
        verificationLogs: (p.verification_logs || []).map((vl: any) => ({
          id: vl.id,
          userId: vl.user,
          username: vl.username,
          bank: vl.bank,
          referenceId: vl.reference_id,
          requestedAmount: parseFloat(vl.requested_amount),
          verifiedAmount: vl.verified_amount ? parseFloat(vl.verified_amount) : undefined,
          currency: vl.currency || 'ETB',
          referenceVerified: vl.reference_verified,
          amountVerified: vl.amount_verified,
          receiverVerified: vl.receiver_verified,
          isVerified: vl.is_verified,
          status: vl.status,
          errorMessage: vl.error_message,
          receiptData: vl.receipt_data,
          createdAt: vl.created_at
        }))
      }));
    }
  } catch (e) {}
  return [];
};

export const approveAdminDepositAPI = async (id: number, adminNote: string = 'Approved'): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/${id}/approve/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ admin_note: adminNote })
    });
    const data = await res.json();
    if (res.ok) {
      window.dispatchEvent(new Event('allin_wallet_updated'));
      return { success: true, message: data.message };
    }
    return { success: false, message: data.error || 'Failed to approve deposit.' };
  } catch (e) {
    return { success: false, message: 'Network error approving deposit.' };
  }
};

export const rejectAdminDepositAPI = async (id: number, adminNote: string = 'Rejected'): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/${id}/reject/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ admin_note: adminNote })
    });
    const data = await res.json();
    if (res.ok) {
      window.dispatchEvent(new Event('allin_wallet_updated'));
      return { success: true, message: data.message };
    }
    return { success: false, message: data.error || 'Failed to reject deposit.' };
  } catch (e) {
    return { success: false, message: 'Network error rejecting deposit.' };
  }
};

export const deleteAdminDepositLogAPI = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/${id}/delete_log/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, message: data.message || 'Deposit log deleted successfully.' };
    }
    return { success: false, message: data.error || 'Failed to delete deposit log.' };
  } catch (e) {
    return { success: false, message: 'Network error deleting deposit log.' };
  }
};

export const bulkDeleteAdminDepositLogsAPI = async (ids?: number[], status?: string): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/bulk_delete/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ids, status })
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, message: data.message || 'Deposit logs deleted successfully.' };
    }
    return { success: false, message: data.error || 'Failed to bulk delete deposit logs.' };
  } catch (e) {
    return { success: false, message: 'Network error bulk deleting deposit logs.' };
  }
};

export const fetchAdminWithdrawalsAPI = async (statusFilter: string = 'PENDING'): Promise<WithdrawalRequest[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/withdrawals/?status=${statusFilter}`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : (data.results || []);
      return rawList.map((w: any) => ({
        id: w.id,
        userId: w.user,
        username: w.username || 'User',
        withdrawalMethod: w.withdrawal_method,
        accountNumber: w.account_number,
        accountName: w.account_name,
        phoneNumber: w.phone_number,
        amount: parseFloat(w.amount),
        transactionId: w.transaction_id,
        status: w.status,
        adminNote: w.admin_note,
        submittedAt: w.submitted_at
      }));
    }
  } catch (e) {}
  return [];
};

export const approveAdminWithdrawalAPI = async (id: number, adminNote: string = 'Approved'): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/withdrawals/${id}/approve/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ admin_note: adminNote })
    });
    const data = await res.json();
    if (res.ok) {
      window.dispatchEvent(new Event('allin_wallet_updated'));
      return { success: true, message: data.message };
    }
    return { success: false, message: data.error || 'Failed to approve withdrawal.' };
  } catch (e) {
    return { success: false, message: 'Network error approving withdrawal.' };
  }
};

export const rejectAdminWithdrawalAPI = async (id: number, adminNote: string = 'Rejected'): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/withdrawals/${id}/reject/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ admin_note: adminNote })
    });
    const data = await res.json();
    if (res.ok) {
      window.dispatchEvent(new Event('allin_wallet_updated'));
      return { success: true, message: data.message };
    }
    return { success: false, message: data.error || 'Failed to reject withdrawal.' };
  } catch (e) {
    return { success: false, message: 'Network error rejecting withdrawal.' };
  }
};

export const fetchAdminUsersAPI = async (): Promise<UserAdminRecord[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      return data.map((u: any) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        accountStatus: u.account_status,
        isActive: u.is_active,
        dateJoined: u.date_joined,
        phoneNumber: u.phone_number
      }));
    }
  } catch (e) {}
  return [];
};

export const toggleAdminUserStatusAPI = async (userId: number, status: string): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/toggle_status/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (res.ok) return { success: true, message: data.message };
    return { success: false, message: data.error || 'Failed to change status.' };
  } catch (e) {
    return { success: false, message: 'Network error updating user status.' };
  }
};

export const changeAdminUserRoleAPI = async (userId: number, role: string): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/change_role/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role })
    });
    const data = await res.json();
    if (res.ok) return { success: true, message: data.message };
    return { success: false, message: data.error || 'Failed to change role.' };
  } catch (e) {
    return { success: false, message: 'Network error updating user role.' };
  }
};

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/categories/`);
    if (res.ok) {
      const data = await res.json();
      return data.length > 0 ? data : MOCK_CATEGORIES;
    }
  } catch (err) {}
  return MOCK_CATEGORIES;
};

export const searchGamesAPI = async (filters: GameFilterState, page: number = 1): Promise<Game[]> => {
  try {
    const params = new URLSearchParams();
    if (filters.searchQuery) params.append('q', filters.searchQuery);
    if (filters.category) params.append('category', filters.category);
    if (filters.gameType) params.append('game_type', filters.gameType);
    if (filters.minEntryFee) params.append('min_fee', filters.minEntryFee.toString());
    if (filters.maxEntryFee) params.append('max_fee', filters.maxEntryFee.toString());
    if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters.sortBy) params.append('sort', filters.sortBy);
    params.append('page', page.toString());
    params.append('page_size', '20');

    const res = await fetch(`${API_BASE_URL}/games/?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : (data.results || []);
      return rawList.map(normalizeGame);
    }
  } catch (e) {}
  return [];
};

export const deductWalletBalance = (amount: number): number => {
  try {
    const savedBal = localStorage.getItem('allin_wallet_balance');
    const current = savedBal ? parseFloat(savedBal) : 5000;
    const newBal = Math.max(0, current - amount);
    localStorage.setItem('allin_wallet_balance', newBal.toString());
    return newBal;
  } catch (e) {
    return 5000;
  }
};

export const fetchGameStatistics = async (gameId: number): Promise<GameStatisticsData> => {
  try {
    const res = await fetch(`${API_BASE_URL}/games/${gameId}/statistics/`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return {
    gameId,
    viewsCount: 120,
    participantsCount: 10,
    maxParticipants: 100,
    completionRate: 10,
    entryFee: 100,
    prizeValue: 50000,
    status: 'ACTIVE'
  };
};

export const incrementGameViewsAPI = async (gameId: number): Promise<number> => {
  try {
    const res = await fetch(`${API_BASE_URL}/games/${gameId}/increment_views/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      return data.views_count || 100;
    }
  } catch (e) {}
  return 100;
};

export const fetchWinnersHistory = async (): Promise<WinnerRecord[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/games/winners/`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return [];
};

// ==========================================
// DEVELOPER 3: PRODUCTS & FULFILLMENT APIS
// ==========================================

export const normalizeDelivery = (raw: any): ProductDelivery => {
  return {
    id: raw.id,
    gameId: raw.game_result?.game || raw.game_id || raw.gameId,
    gameTitle: raw.game_title || raw.gameTitle || 'Competition Prize',
    productTitle: raw.product_title || raw.productTitle || 'Product',
    productImage: raw.product_image || raw.productImage || '',
    winnerName: raw.winner_name || raw.winnerName || 'Winner',
    sellerName: raw.seller_name || raw.sellerName || 'Seller',
    sellerPhone: raw.seller_phone || raw.sellerPhone || '',
    deliveryAddress: raw.delivery_address || raw.deliveryAddress || '',
    phoneNumber: raw.phone_number || raw.phoneNumber || '',
    trackingCode: raw.tracking_code || raw.trackingCode || '',
    status: raw.status || 'PREPARING',
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString()
  };
};

export const fetchProductsAPI = async (statusFilter?: string, myOnly?: boolean): Promise<Product[]> => {
  try {
    let url = `${API_BASE_URL}/products/`;
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== 'ALL') params.append('status', statusFilter);
    if (myOnly) params.append('my', 'true');
    const qs = params.toString();
    if (qs) url += `?${qs}`;

    const res = await fetch(url, { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : (data.results || []);
      return rawList.map(normalizeProduct);
    }
  } catch (e) {}
  return [];
};

export const fetchSellerProductsAPI = async (): Promise<Product[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/products/my_products/`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : (data.results || []);
      return rawList.map(normalizeProduct);
    }
  } catch (e) {}
  return [];
};

export const createProductAPI = async (productData: Partial<Product>): Promise<{ success: boolean; product?: Product; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/products/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        title: productData.title,
        category: productData.category,
        description: productData.description,
        image_url: productData.imageUrl,
        condition: productData.condition || 'NEW',
        estimated_value: productData.estimatedValue,
        location: productData.location || 'Addis Ababa'
      })
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, product: normalizeProduct(data), message: 'Product submitted successfully for admin review!' };
    }
    return { success: false, message: extractErrorMessage(data, 'Failed to create product.') };
  } catch (e) {
    return { success: false, message: 'Network error creating product.' };
  }
};

export const updateProductAPI = async (id: number, productData: Partial<Product>): Promise<{ success: boolean; product?: Product; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        title: productData.title,
        category: productData.category,
        description: productData.description,
        image_url: productData.imageUrl,
        condition: productData.condition,
        estimated_value: productData.estimatedValue,
        location: productData.location
      })
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, product: normalizeProduct(data), message: 'Product updated successfully.' };
    }
    return { success: false, message: extractErrorMessage(data, 'Failed to update product.') };
  } catch (e) {
    return { success: false, message: 'Network error updating product.' };
  }
};

export const deleteProductAPI = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      return { success: true, message: 'Product deleted successfully.' };
    }
    const data = await res.json().catch(() => ({}));
    return { success: false, message: data.error || 'Failed to delete product.' };
  } catch (e) {
    return { success: false, message: 'Network error deleting product.' };
  }
};

export const approveProductAPI = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}/approve/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (res.ok) return { success: true, message: data.message || 'Product approved!' };
    return { success: false, message: data.error || 'Failed to approve product.' };
  } catch (e) {
    return { success: false, message: 'Network error approving product.' };
  }
};

export const rejectProductAPI = async (id: number, reason?: string): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}/reject/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    const data = await res.json();
    if (res.ok) return { success: true, message: data.message || 'Product rejected.' };
    return { success: false, message: data.error || 'Failed to reject product.' };
  } catch (e) {
    return { success: false, message: 'Network error rejecting product.' };
  }
};

// ==========================================
// SELLER PORTAL & STATS APIS
// ==========================================

export const fetchSellerProfileAPI = async (): Promise<Seller | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/sellers/me/`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      return {
        id: data.id,
        businessName: data.business_name,
        description: data.description || '',
        phoneNumber: data.phone_number,
        address: data.address,
        status: data.status
      };
    }
  } catch (e) {}
  return null;
};

export const updateSellerProfileAPI = async (data: Partial<Seller>): Promise<{ success: boolean; seller?: Seller; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/sellers/me/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        business_name: data.businessName,
        description: data.description,
        phone_number: data.phoneNumber,
        address: data.address
      })
    });
    const resData = await res.json();
    if (res.ok) {
      return {
        success: true,
        seller: {
          id: resData.id,
          businessName: resData.business_name,
          description: resData.description || '',
          phoneNumber: resData.phone_number,
          address: resData.address,
          status: resData.status
        },
        message: 'Seller profile updated successfully.'
      };
    }
    return { success: false, message: resData.error || 'Failed to update seller profile.' };
  } catch (e) {
    return { success: false, message: 'Network error updating seller profile.' };
  }
};

export const fetchSellerStatsAPI = async (): Promise<SellerStats> => {
  try {
    const res = await fetch(`${API_BASE_URL}/sellers/stats/`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const d = await res.json();
      return {
        totalProducts: d.total_products || 0,
        activeProducts: d.active_products || 0,
        totalGames: d.total_games || 0,
        activeGames: d.active_games || 0,
        completedGames: d.completed_games || 0,
        totalRevenueEtb: d.total_revenue_etb || 0,
        pendingDeliveries: d.pending_deliveries || 0,
        completedDeliveries: d.completed_deliveries || 0,
        averageRating: d.average_rating || 0,
        ratingCount: d.rating_count || 0,
        walletBalance: d.wallet_balance || 0
      };
    }
  } catch (e) {}
  return {
    totalProducts: 0,
    activeProducts: 0,
    totalGames: 0,
    activeGames: 0,
    completedGames: 0,
    totalRevenueEtb: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
    averageRating: 0,
    ratingCount: 0,
    walletBalance: 0
  };
};

export const fetchSellerAnalyticsAPI = async (): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE_URL}/sellers/analytics/`, {
      headers: getAuthHeaders()
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { games_performance: [], ratings_breakdown: {}, recent_reviews: [] };
};

export const fetchSellerGamesAPI = async (): Promise<Game[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/games/seller_games/`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : (data.results || []);
      return rawList.map(normalizeGame);
    }
  } catch (e) {}
  return [];
};

export const createSellerGameAPI = async (gameData: any): Promise<{ success: boolean; game?: Game; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/games/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(gameData)
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, game: normalizeGame(data), message: 'Competition created and submitted for admin review!' };
    }
    return { success: false, message: extractErrorMessage(data, 'Failed to create competition.') };
  } catch (e) {
    return { success: false, message: 'Network error creating competition.' };
  }
};

export const fetchPendingSellersAPI = async (): Promise<Seller[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/sellers/pending/`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      return data.map((s: any) => ({
        id: s.id,
        user: s.user,
        username: s.username || (s.user ? `User #${s.user}` : 'Applicant'),
        businessName: s.business_name || s.businessName || 'Unnamed Store',
        business_name: s.business_name || s.businessName || 'Unnamed Store',
        description: s.description || '',
        phoneNumber: s.phone_number || s.phoneNumber || 'N/A',
        phone_number: s.phone_number || s.phoneNumber || 'N/A',
        address: s.address || 'Addis Ababa',
        status: s.status || 'PENDING'
      }));
    }
  } catch (e) {}
  return [];
};

export const approveSellerAPI = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/sellers/${id}/approve/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (res.ok) return { success: true, message: data.message || 'Seller approved.' };
    return { success: false, message: data.error || 'Failed to approve seller.' };
  } catch (e) {
    return { success: false, message: 'Network error approving seller.' };
  }
};

export const rejectSellerAPI = async (id: number, reason?: string): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/sellers/${id}/reject/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    const data = await res.json();
    if (res.ok) return { success: true, message: data.message || 'Seller rejected.' };
    return { success: false, message: data.error || 'Failed to reject seller.' };
  } catch (e) {
    return { success: false, message: 'Network error rejecting seller.' };
  }
};

// ==========================================
// FULFILLMENT & DELIVERIES APIS
// ==========================================

export const fetchDeliveriesAPI = async (): Promise<ProductDelivery[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/deliveries/`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : (data.results || []);
      return rawList.map(normalizeDelivery);
    }
  } catch (e) {}
  return [];
};

export const updateDeliveryStatusAPI = async (id: number, status: string, trackingCode?: string): Promise<{ success: boolean; delivery?: ProductDelivery; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/deliveries/${id}/update_status/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, tracking_code: trackingCode })
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, delivery: normalizeDelivery(data.delivery), message: data.message || 'Delivery updated.' };
    }
    return { success: false, message: data.error || 'Failed to update delivery.' };
  } catch (e) {
    return { success: false, message: 'Network error updating delivery.' };
  }
};

export const updateDeliveryAddressAPI = async (id: number, deliveryAddress: string, phoneNumber: string): Promise<{ success: boolean; delivery?: ProductDelivery; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/deliveries/${id}/update_address/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ delivery_address: deliveryAddress, phone_number: phoneNumber })
    });
    const data = await res.json();
    if (res.ok) {
      return { success: true, delivery: normalizeDelivery(data.delivery), message: data.message || 'Address updated.' };
    }
    return { success: false, message: data.error || 'Failed to update address.' };
  } catch (e) {
    return { success: false, message: 'Network error updating delivery address.' };
  }
};

// ==========================================
// SELLER RATINGS & REVIEWS APIS
// ==========================================

export const fetchSellerRatingsAPI = async (sellerId?: number): Promise<SellerRating[]> => {
  try {
    const query = sellerId ? `?seller_id=${sellerId}` : '';
    const res = await fetch(`${API_BASE_URL}/ratings/${query}`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : (data.results || []);
      return rawList.map((r: any) => ({
        id: r.id,
        seller: r.seller,
        sellerName: r.seller_name,
        user: r.user,
        userUsername: r.user_username,
        game: r.game,
        rating: r.rating,
        review: r.review,
        createdAt: r.created_at
      }));
    }
  } catch (e) {}
  return [];
};

export const submitSellerRatingAPI = async (data: { seller: number; rating: number; review?: string; game?: number }): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/ratings/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const resData = await res.json();
    if (res.ok) {
      return { success: true, message: 'Review submitted successfully!' };
    }
    return { success: false, message: resData.error || 'Failed to submit review.' };
  } catch (e) {
    return { success: false, message: 'Network error submitting review.' };
  }
};

// ==========================================
// REPORTS & MODERATION APIS
// ==========================================

export const submitReportAPI = async (data: { targetType: string; targetId: number; targetLabel?: string; category: string; reason: string }): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/reports/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        target_type: data.targetType,
        target_id: data.targetId,
        target_label: data.targetLabel || '',
        category: data.category,
        reason: data.reason
      })
    });
    const resData = await res.json();
    if (res.ok) {
      return { success: true, message: 'Report submitted to moderators. Thank you for keeping the community safe.' };
    }
    return { success: false, message: resData.error || 'Failed to submit report.' };
  } catch (e) {
    return { success: false, message: 'Network error submitting report.' };
  }
};

export const fetchAdminReportsAPI = async (statusFilter?: string): Promise<Report[]> => {
  try {
    const query = statusFilter && statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
    const res = await fetch(`${API_BASE_URL}/reports/${query}`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : (data.results || []);
      return rawList.map((r: any) => ({
        id: r.id,
        reporter: r.reporter,
        reporterUsername: r.reporter_username,
        targetType: r.target_type,
        targetId: r.target_id,
        targetLabel: r.target_label,
        category: r.category,
        reason: r.reason,
        status: r.status,
        moderator: r.moderator,
        moderatorUsername: r.moderator_username,
        resolutionNote: r.resolution_note,
        createdAt: r.created_at,
        resolvedAt: r.resolved_at
      }));
    }
  } catch (e) {}
  return [];
};

export const resolveReportAPI = async (id: number, resolutionNote: string, status: string = 'RESOLVED', actionTaken: string = 'NO_ACTION'): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/reports/${id}/resolve/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ resolution_note: resolutionNote, status, action_taken: actionTaken })
    });
    const data = await res.json();
    if (res.ok) return { success: true, message: data.message || 'Report updated.' };
    return { success: false, message: data.error || 'Failed to resolve report.' };
  } catch (e) {
    return { success: false, message: 'Network error resolving report.' };
  }
};

// ==========================================
// PLATFORM SETTINGS APIS
// ==========================================

export const fetchPlatformSettingsAPI = async (): Promise<PlatformSetting[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/settings/`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : (data.results || []);
      return rawList.map((s: any) => ({
        id: s.id,
        key: s.key,
        value: s.value,
        description: s.description || '',
        updatedAt: s.updated_at
      }));
    }
  } catch (e) {}
  return [];
};

export const updatePlatformSettingsAPI = async (settings: Array<{ key: string; value: string; description?: string }> | Record<string, string>): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/settings/update_settings/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ settings })
    });
    const data = await res.json();
    if (res.ok) return { success: true, message: data.message || 'Settings saved.' };
    return { success: false, message: data.error || 'Failed to update settings.' };
  } catch (e) {
    return { success: false, message: 'Network error updating settings.' };
  }
};

// ==========================================
// ADMIN USER BANS & PLATFORM ANALYTICS APIS
// ==========================================

export const banUserAPI = async (userId: number, reason: string): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/ban/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    const data = await res.json();
    if (res.ok) return { success: true, message: data.message || 'User banned.' };
    return { success: false, message: data.error || 'Failed to ban user.' };
  } catch (e) {
    return { success: false, message: 'Network error banning user.' };
  }
};

export const unbanUserAPI = async (userId: number): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/unban/`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (res.ok) return { success: true, message: data.message || 'User unbanned.' };
    return { success: false, message: data.error || 'Failed to unban user.' };
  } catch (e) {
    return { success: false, message: 'Network error unbanning user.' };
  }
};

export const fetchAdminPlatformAnalyticsAPI = async (): Promise<AdminPlatformAnalytics | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/analytics/`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const d = await res.json();
      return {
        users: {
          total: d.users?.total || 0,
          active: d.users?.active || 0,
          banned: d.users?.banned || 0,
          verifiedSellers: d.users?.verified_sellers || 0,
          pendingSellers: d.users?.pending_sellers || 0
        },
        competitions: {
          total: d.competitions?.total || 0,
          active: d.competitions?.active || 0,
          completed: d.competitions?.completed || 0,
          pendingApproval: d.competitions?.pending_approval || 0,
          totalEntries: d.competitions?.total_entries || 0
        },
        products: {
          total: d.products?.total || 0,
          approved: d.products?.approved || 0,
          pending: d.products?.pending || 0,
          rejected: d.products?.rejected || 0
        },
        financials: {
          totalDepositsEtb: d.financials?.total_deposits_etb || 0,
          pendingDepositsCount: d.financials?.pending_deposits_count || 0,
          totalWithdrawalsEtb: d.financials?.total_withdrawals_etb || 0,
          pendingWithdrawalsCount: d.financials?.pending_withdrawals_count || 0,
          platformVolumeEtb: d.financials?.platform_volume_etb || 0
        },
        fulfillment: {
          totalDeliveries: d.fulfillment?.total_deliveries || 0,
          pendingDeliveries: d.fulfillment?.pending_deliveries || 0,
          completedDeliveries: d.fulfillment?.completed_deliveries || 0
        },
        moderation: {
          pendingReports: d.moderation?.pending_reports || 0
        }
      };
    }
  } catch (e) {}
  return null;
};


