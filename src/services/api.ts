import type { Game, Product, Wallet } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

// Seed mock data for rich fallback state
const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    title: "PlayStation 5 Digital Edition (Slim)",
    category: "Gaming Consoles",
    description: "Brand new 1TB PS5 Digital Edition console with extra DualSense controller.",
    imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80",
    condition: "NEW",
    estimatedValue: 65000,
    location: "Bole, Addis Ababa",
    approvalStatus: "APPROVED"
  },
  {
    id: 2,
    title: "iPhone 15 Pro Max - 256GB Natural Titanium",
    category: "Smartphones",
    description: "Unopened sealed box iPhone 15 Pro Max with official warranty.",
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80",
    condition: "NEW",
    estimatedValue: 145000,
    location: "Kazanchis, Addis Ababa",
    approvalStatus: "APPROVED"
  },
  {
    id: 3,
    title: "Apple MacBook Pro 14 M3 Chip",
    category: "Laptops",
    description: "M3 chip, 16GB Unified Memory, 512GB SSD Space Gray.",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
    condition: "NEW",
    estimatedValue: 185000,
    location: "Piassa, Addis Ababa",
    approvalStatus: "APPROVED"
  },
  {
    id: 4,
    title: "Sony WH-1000XM5 Wireless Headphones",
    category: "Audio",
    description: "Industry-leading noise canceling wireless over-ear headphones.",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    condition: "NEW",
    estimatedValue: 28000,
    location: "Sarbet, Addis Ababa",
    approvalStatus: "APPROVED"
  }
];

const MOCK_GAMES: Game[] = [
  {
    id: 1,
    product: MOCK_PRODUCTS[0],
    sellerName: "Addis Tech Hub",
    title: "PS5 Slim - Treasure Box Challenge",
    gameType: "TREASURE_BOX",
    entryFee: 500,
    maxParticipants: 100,
    participantsCount: 42,
    totalBoxes: 100,
    durationMinutes: 180,
    rulesDescription: "Choose 1 available box out of 100. When timer ends, backend randomly picks one box that was chosen by a player. The participant who picked that box wins the PS5!",
    status: "ACTIVE",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    product: MOCK_PRODUCTS[1],
    sellerName: "Titanium Electronics",
    title: "iPhone 15 Pro - Lowest Unique Number",
    gameType: "LOWEST_UNIQUE",
    entryFee: 1000,
    maxParticipants: 50,
    participantsCount: 28,
    durationMinutes: 240,
    rulesDescription: "Submit a number between 1 and 100. Duplicate numbers chosen by multiple users are eliminated. The lowest number chosen by ONLY 1 user wins!",
    status: "ACTIVE",
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    product: MOCK_PRODUCTS[2],
    sellerName: "MacCenter Ethiopia",
    title: "MacBook Pro M3 - Secret Number Guess",
    gameType: "SECRET_NUMBER",
    entryFee: 1500,
    maxParticipants: 30,
    participantsCount: 15,
    durationMinutes: 120,
    rulesDescription: "The backend generated a secret target number between 1 and 500. Submit your guess. The participant closest to the target wins!",
    status: "ACTIVE",
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    product: MOCK_PRODUCTS[3],
    sellerName: "AudioZone",
    title: "Sony Headphones - Precision Timer",
    gameType: "PRECISION_TIMER",
    entryFee: 200,
    maxParticipants: 60,
    participantsCount: 35,
    durationMinutes: 90,
    rulesDescription: "Press Start and try to stop the timer as close as possible to 5.000 seconds. The smallest time difference (delta in ms) wins!",
    status: "ACTIVE",
    createdAt: new Date().toISOString()
  }
];

export const fetchGames = async (): Promise<Game[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/games/`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend API offline, using fallback state:", err);
  }
  return MOCK_GAMES;
};

export const fetchWallet = async (): Promise<Wallet> => {
  try {
    const res = await fetch(`${API_BASE_URL}/wallets/1/`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend API offline, using fallback wallet:", err);
  }
  return {
    balance: 2500,
    transactions: [
      { id: 1, transactionType: 'DEPOSIT', amount: 3000, referenceId: 'TX987654', note: 'Approved Telebirr Deposit', createdAt: new Date().toISOString() },
      { id: 2, transactionType: 'GAME_ENTRY', amount: -500, referenceId: 'GAME-1', note: 'Joined PS5 Treasure Box', createdAt: new Date().toISOString() }
    ]
  };
};

export const joinGameAPI = async (gameId: number, selectionData: Record<string, any>): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/games/${gameId}/join_game/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 1, ...selectionData })
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, message: data.message };
    } else {
      const data = await res.json();
      return { success: false, message: data.error || 'Failed to join game.' };
    }
  } catch (err) {
    // Fallback simulation
    return { success: true, message: "Successfully joined game! (Demo mode)" };
  }
};

export const submitPaymentProof = async (data: { paymentMethod: string; transactionId: string; amount: number }): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: 1,
        payment_method: data.paymentMethod,
        transaction_id: data.transactionId,
        amount: data.amount,
        status: 'PENDING'
      })
    });
    if (res.ok) {
      return { success: true, message: "Payment proof submitted! Pending Admin verification." };
    }
  } catch (err) {
    console.warn("API offline fallback payment submission");
  }
  return { success: true, message: "Payment proof submitted! Pending Admin verification. (Demo mode)" };
};
