export type Role = 'USER' | 'SELLER' | 'ADMIN';

export type GameType = 
  | 'TREASURE_BOX'
  | 'LOWEST_UNIQUE'
  | 'HIGHEST_CARD'
  | 'SECRET_NUMBER'
  | 'PREDICTION'
  | 'PRECISION_TIMER';

export type GameStatus = 
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED';

export type DeliveryStatus = 
  | 'PREPARING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CONFIRMED';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  telegramUsername?: string;
}

export interface Seller {
  id: number;
  businessName: string;
  description: string;
  phoneNumber: string;
  address: string;
  status: 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED';
}

export interface Product {
  id: number;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  condition: 'NEW' | 'REFURBISHED' | 'USED';
  estimatedValue: number;
  location: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Game {
  id: number;
  product: Product;
  sellerName: string;
  title: string;
  gameType: GameType;
  entryFee: number;
  maxParticipants: number;
  participantsCount: number;
  totalBoxes?: number;
  durationMinutes: number;
  rulesDescription: string;
  status: GameStatus;
  createdAt: string;
  winnerName?: string;
  winningValue?: string;
}

export interface GameParticipant {
  id: number;
  gameId: number;
  userId: number;
  username: string;
  selectedBox?: number;
  selectedNumber?: number;
  selectedCard?: string;
  predictionAnswer?: number;
  timerDeltaMs?: number;
  joinedAt: string;
}

export interface WalletTransaction {
  id: number;
  transactionType: 'DEPOSIT' | 'GAME_ENTRY' | 'REFUND' | 'WITHDRAWAL' | 'REWARD';
  amount: number;
  referenceId: string;
  note: string;
  createdAt: string;
}

export interface Wallet {
  balance: number;
  transactions: WalletTransaction[];
}

export interface PaymentSubmission {
  id: number;
  userId: number;
  username: string;
  paymentMethod: string;
  transactionId: string;
  amount: number;
  proofImageUrl?: string;
  status: PaymentStatus;
  adminNote?: string;
  submittedAt: string;
}

export interface ProductDelivery {
  id: number;
  gameTitle: string;
  winnerName: string;
  sellerName: string;
  deliveryAddress: string;
  phoneNumber: string;
  trackingCode?: string;
  status: DeliveryStatus;
  updatedAt: string;
}

export interface AnalyticsSummary {
  totalUsers: number;
  totalSellers: number;
  activeGames: number;
  completedGames: number;
  totalGameEntries: number;
  totalDepositsApproved: number;
  totalProducts: number;
}
