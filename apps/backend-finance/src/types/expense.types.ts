/**
 * TUSU Expense Analysis - Type Definitions
 */

export interface BankStatementItem {
  date: Date;
  description: string;
  category: string;
  amount: number;
  currency: string;
}

export interface CategorySpending {
  category: string;
  totalAmount: number;
  transactionCount: number;
}

export interface CategoryAnalysis {
  category: string;
  averageMonthlySpending: number;
  currentMonthSpending: number;
  percentageChange: number;
  isExcessive: boolean;
  potentialSavings: number;
  recommendation?: InvestmentRecommendation;
}

export interface InvestmentRecommendation {
  asset: string;
  trend: string;
  estimatedGain: number;
  message: string;
}

export interface ExpenseAnalysisResult {
  analysisDate: string;
  totalPotentialSavings: number;
  excessiveCategories: CategoryAnalysis[];
  message: string;
  recommendations: string[];
}

export interface AnalyzeExpensesRequest {
  transactions: BankStatementItem[];
  currentMonth?: string; // Optional: defaults to current month
}
