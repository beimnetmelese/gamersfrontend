import type {
  Game, Product, Wallet, Category, WinnerRecord, GameFilterState,
  GameStatisticsData, User, UserStats, Favorite, Notification,
  PaymentSubmission, WithdrawalRequest, UserAdminRecord, HistoryRecord
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

// --- AUTHENTICATION APIS ---

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
      return {
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role || 'USER',
        accountStatus: data.account_status || 'ACTIVE',
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
    return { success: false, message: err.error || "Failed to update profile." };
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

export const fetchPendingSellersAPI = async (): Promise<any[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/sellers/pending/`, {
      headers: getAuthHeaders()
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return [];
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
        records.push({
          id: `TX-${t.id}`,
          date: t.created_at,
          type: t.transaction_type,
          title: t.note || `${t.transaction_type} Ledger Entry`,
          amount: Math.abs(parseFloat(t.amount)),
          direction: t.direction || (t.amount >= 0 ? 'CREDIT' : 'DEBIT'),
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

export const fetchAdminDepositsAPI = async (statusFilter: string = 'PENDING'): Promise<PaymentSubmission[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/?status=${statusFilter}`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : (data.results || []);
      return rawList.map((p: any) => ({
        id: p.id,
        userId: p.user,
        username: p.username || 'User',
        paymentMethod: p.payment_method,
        transactionId: p.transaction_id,
        amount: parseFloat(p.amount),
        proofImageUrl: p.proof_image ? (p.proof_image.startsWith('http') ? p.proof_image : `http://localhost:8000${p.proof_image}`) : undefined,
        status: p.status,
        adminNote: p.admin_note,
        submittedAt: p.submitted_at
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

