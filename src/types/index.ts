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
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  role: Role;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  telegram_id?: string;
  telegram_username?: string;
  telegram_first_name?: string;
  notificationPreferences?: Record<string, boolean>;
  privacySettings?: Record<string, boolean>;
  language?: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe?: {
          query_id?: string;
          user?: {
            id: number | string;
            first_name?: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            photo_url?: string;
          };
          auth_date?: string;
          hash?: string;
        };
        version?: string;
        platform?: string;
        ready: () => void;
        expand: () => void;
        close: () => void;
      };
    };
  }
}

export interface UserAdminRecord {
  id: number;
  username: string;
  email: string;
  role: Role;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  isActive: boolean;
  dateJoined: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  phoneNumber?: string;
  phone_number?: string;
  bio?: string;
  avatarUrl?: string;
  avatar_url?: string;
  telegramId?: string;
  telegram_id?: string;
  banReason?: string;
  bannedAt?: string;
}

export interface AdminUserDetails {
  user: UserAdminRecord & { first_name?: string; last_name?: string; telegram_id?: string; ban_reason?: string };
  wallet: { balance: number; reserved_balance: number; available_balance: number };
  activity: { game_entries: number; games_won: number; favorites: number; unread_notifications: number; last_login?: string; date_joined: string };
  financials: {
    period_start: string;
    period_end: string;
    deposits_approved: number;
    deposits_pending: number;
    deposits_refunded: number;
    withdrawals_approved: number;
    withdrawals_pending: number;
    entry_spend: number;
    rewards_received: number;
    transaction_count: number;
  };
  seller: { business_name: string; status: string; address: string; created_at: string } | null;
  recent_transactions: Array<{ id: number; type: string; direction: string; status: string; amount: number; note: string; created_at: string }>;
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number;
  totalEntries: number;
  totalSpent: number;
}

export interface UserBadge {
  key: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  threshold: number;
  field: string;
  points: number;
  earned: boolean;
  progress: number;
  rank: number;
  leaderboard: Array<{ rank: number; username: string; score: number; points: number; is_current_user: boolean }>;
}

export interface UserBadgeData {
  total_points: number;
  metrics: { entries: number; wins: number; games_played: number; spent: number; game_types: number; win_rate: number; points: number };
  badges: UserBadge[];
  leaderboards: {
    winners: { rank: number; rows: Array<{ rank: number; username: string; score: number; points: number; is_current_user: boolean }> };
    games_played: { rank: number; rows: Array<{ rank: number; username: string; score: number; points: number; is_current_user: boolean }> };
  };
}

export interface Seller {
  id: number;
  user?: number;
  username?: string;
  businessName: string;
  business_name?: string;
  description: string;
  phoneNumber: string;
  phone_number?: string;
  address: string;
  status: 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED';
}

export interface Product {
  id: number;
  sellerId?: number;
  sellerName?: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  condition: 'NEW' | 'REFURBISHED' | 'USED';
  estimatedValue: number;
  location: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt?: string;
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
  gameId?: number;
  gameTitle: string;
  productTitle?: string;
  productImage?: string;
  winnerName: string;
  sellerName: string;
  sellerPhone?: string;
  deliveryAddress: string;
  phoneNumber: string;
  trackingCode?: string;
  status: DeliveryStatus;
  createdAt?: string;
  updatedAt: string;
}

export interface SellerRating {
  id: number;
  seller: number;
  sellerName?: string;
  user?: number;
  userUsername?: string;
  game?: number;
  rating: number;
  review: string;
  createdAt: string;
}

export type ReportTargetType = 'USER' | 'SELLER' | 'GAME' | 'PRODUCT';
export type ReportCategory = 'SCAM' | 'MISLEADING' | 'INAPPROPRIATE' | 'NON_DELIVERY' | 'OTHER';
export type ReportStatus = 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export interface Report {
  id: number;
  reporter?: number;
  reporterUsername?: string;
  targetType: ReportTargetType;
  targetId: number;
  targetLabel?: string;
  category: ReportCategory;
  reason: string;
  status: ReportStatus;
  moderator?: number;
  moderatorUsername?: string;
  resolutionNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface PlatformSetting {
  id: number;
  key: string;
  value: string;
  description: string;
  updatedAt: string;
}

export interface SellerStats {
  totalProducts: number;
  activeProducts: number;
  totalGames: number;
  activeGames: number;
  completedGames: number;
  totalRevenueEtb: number;
  pendingDeliveries: number;
  completedDeliveries: number;
  averageRating: number;
  ratingCount: number;
  walletBalance: number;
}

export interface AdminPlatformAnalytics {
  users: {
    total: number;
    active: number;
    active30d: number;
    banned: number;
    verifiedSellers: number;
    pendingSellers: number;
    retentionRate: number;
    retentionEligible: number;
    retainedUsers: number;
  };
  competitions: {
    total: number;
    active: number;
    completed: number;
    pendingApproval: number;
    totalEntries: number;
  };
  products: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  financials: {
    periodStart: string;
    periodEnd: string;
    totalDepositsEtb: number;
    pendingDepositsCount: number;
    rejectedDepositsCount: number;
    refundedDepositsEtb: number;
    totalWithdrawalsEtb: number;
    pendingWithdrawalsCount: number;
    rejectedWithdrawalsCount: number;
    platformVolumeEtb: number;
    grossRevenueEtb: number;
    refundsEtb: number;
    commissionPercent: number;
    commissionEtb: number;
    netCommissionEtb: number;
    rewardPayoutsEtb: number;
    averageEntryFeeEtb: number;
    averageDepositEtb: number;
    averageWithdrawalEtb: number;
    gameEntryCount: number;
    walletBalanceEtb: number;
    reservedWalletBalanceEtb: number;
    availableWalletBalanceEtb: number;
    pendingWithdrawalValueEtb: number;
    netCashFlowEtb: number;
    grossProfitEtb: number;
    netProfitEtb: number;
    cashOutflowEtb: number;
    payoutRatioPercent: number;
    refundRatePercent: number;
    commissionMarginPercent: number;
    depositApprovalRatePercent: number;
    postWithdrawalLiquidityEtb: number;
  };
  fulfillment: {
    totalDeliveries: number;
    pendingDeliveries: number;
    completedDeliveries: number;
  };
  moderation: {
    pendingReports: number;
  };
  trends: {
    users: Array<{ date: string; value: number }>;
    sellers: Array<{ date: string; value: number }>;
    games: Array<{ date: string; value: number }>;
    dailyParticipants: Array<{ date: string; participants: number; revenue: number }>;
  };
  popularGameTypes: Array<{ type: string; games: number; participants: number }>;
  popularProducts: Array<{ id: number; title: string; category: string; games: number; participants: number }>;
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
