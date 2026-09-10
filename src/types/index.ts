export type Role = 'USER' | 'SELLER' | 'ADMIN';

export type GameType = 
  | 'TREASURE_BOX'
  | 'LOWEST_UNIQUE'
  | 'HIGHEST_CARD'
  | 'SECRET_NUMBER'
  | 'PRECISION_TIMER'
  | 'HEAD_TO_HEAD'
  | 'TOURNAMENT';

export type GameStatus = 
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'REJECTED';

export type CategoryName = 
  | 'Phones'
  | 'Laptops'
  | 'Gaming'
  | 'Electronics'
  | 'Fashion'
  | 'Home'
  | 'Vehicles'
  | 'Other';

export interface Category {
  id: number;
  name: CategoryName;
  slug: string;
  icon: string;
  description: string;
  gameCount?: number;
}

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

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
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  notificationPreferences?: Record<string, boolean>;
  privacySettings?: Record<string, boolean>;
  language?: string;
}

export interface UserAdminRecord {
  id: number;
  username: string;
  email: string;
  role: Role;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  isActive: boolean;
  dateJoined: string;
  phoneNumber?: string;
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number;
  totalEntries: number;
  totalSpent: number;
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
  endTime?: string;
  rulesDescription: string;
  status: GameStatus;
  createdAt: string;
  isFeatured?: boolean;
  isRecommended?: boolean;
  isFavorited?: boolean;
  viewsCount?: number;
  questionPrompt?: string;
  targetTimeSec?: number;
  winnerName?: string;
  winningValue?: string;
  bracketData?: any;
  participants?: GameParticipant[];
  rejectionReason?: string;
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
  h2hChoice?: string;
  tournamentSlot?: number;
  joinedAt: string;
}

export interface WinnerRecord {
  id: number;
  gameId: number;
  gameTitle: string;
  winnerName: string;
  winningValue: string;
  productTitle: string;
  productImage: string;
  calculatedAt: string;
}

export interface Favorite {
  id: number;
  gameId: number;
  gameTitle: string;
  productImage: string;
  entryFee: number;
  gameType: string;
  status: string;
  createdAt: string;
}

export interface GameFilterState {
  searchQuery: string;
  category: string;
  gameType: string;
  minEntryFee: number;
  maxEntryFee: number;
  status: string;
  sortBy: 'newest' | 'fee_low' | 'fee_high' | 'popular' | 'ending_soon';
}

export interface GameStatisticsData {
  gameId: number;
  viewsCount: number;
  participantsCount: number;
  maxParticipants: number;
  completionRate: number;
  entryFee: number;
  prizeValue: number;
  status: string;
}

export interface WalletTransaction {
  id: number;
  transactionType: 'DEPOSIT' | 'GAME_ENTRY' | 'REFUND' | 'WITHDRAWAL' | 'REWARD';
  direction?: 'CREDIT' | 'DEBIT';
  status?: 'COMPLETED' | 'PENDING' | 'REJECTED' | 'CANCELLED';
  amount: number;
  referenceId: string;
  note: string;
  createdAt: string;
}

export interface Wallet {
  balance: number;
  reservedBalance: number;
  availableBalance: number;
  transactions: WalletTransaction[];
}

export interface PaymentVerificationLog {
  id: number;
  userId?: number;
  username?: string;
  bank: 'cbe' | 'telebirr' | string;
  referenceId: string;
  requestedAmount: number;
  verifiedAmount?: number;
  currency: string;
  referenceVerified: boolean;
  amountVerified: boolean;
  receiverVerified: boolean;
  isVerified: boolean;
  status: string;
  errorMessage?: string;
  receiptData?: any;
  createdAt: string;
}

export interface PaymentSubmission {
  id: number;
  userId: number;
  username: string;
  userEmail?: string;
  userPhone?: string;
  walletBalance?: number;
  bank?: string;
  paymentMethod: string;
  transactionId: string;
  amount: number;
  proofImageUrl?: string;
  status: PaymentStatus;
  adminNote?: string;
  submittedAt: string;
  verificationLogs?: PaymentVerificationLog[];
}

export interface WithdrawalRequest {
  id: number;
  userId: number;
  username: string;
  withdrawalMethod: string;
  accountNumber: string;
  accountName?: string;
  phoneNumber?: string;
  amount: number;
  transactionId: string;
  status: WithdrawalStatus;
  adminNote?: string;
  submittedAt: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  eventType: 'DEPOSIT' | 'WITHDRAWAL' | 'GAME_EVENT' | 'GAME_WIN' | 'GAME_LOSS' | 'REFUND' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
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
  totalWithdrawalsApproved?: number;
  totalProducts: number;
}

export interface HistoryRecord {
  id: string;
  date: string;
  type: 'GAME' | 'DEPOSIT' | 'WITHDRAWAL' | 'REFUND' | 'REWARD';
  title: string;
  amount: number;
  direction: 'CREDIT' | 'DEBIT';
  status: string;
  referenceId: string;
  details?: string;
}
