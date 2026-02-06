/**
 * TUSU Expense Analysis Service
 * 
 * Features:
 * 1. Habit Learning: Analyzes historical spending patterns by category
 * 2. Anomaly Detection: Identifies excessive consumption (>20% above average)
 * 3. Savings Recommendations: Calculates potential savings opportunities
 */

import {
    BankStatementItem,
    CategorySpending,
    CategoryAnalysis,
    ExpenseAnalysisResult
} from '../types/expense.types';

export class ExpenseAnalysisService {
    /**
     * Mock historical data - This will be replaced with DB calls later
     * Represents average monthly spending per category based on past months
     */
    private mockHistoricalAverages: Map<string, number> = new Map([
        ['Dining', 3000],
        ['Transportation', 2000],
        ['Shopping', 4000],
        ['Entertainment', 1500],
        ['Utilities', 1000],
        ['Groceries', 2500],
    ]);

    /**
     * Main analysis method
     * @param transactions - Current month's transactions
     * @returns Analysis results with anomalies and savings recommendations
     */
    public analyzeExpenses(transactions: BankStatementItem[]): ExpenseAnalysisResult {
        // Step 1: Group transactions by category
        const categorySpending = this.groupByCategory(transactions);

        // Step 2: Calculate averages from historical data (or mock data)
        const historicalAverages = this.getHistoricalAverages(categorySpending);

        // Step 3: Analyze all categories
        const allAnalysis = this.analyzeCategories(categorySpending, historicalAverages);

        // Filter anomalies (>20% total spending)
        const anomalies = allAnalysis.filter(c => c.isExcessive);

        // Step 4: Calculate total potential savings
        const totalSavings = anomalies.reduce((sum, a) => sum + a.potentialSavings, 0);

        // Step 5: Generate recommendations
        const recommendations = this.generateRecommendations(anomalies);

        return {
            analysisDate: new Date().toISOString(),
            totalPotentialSavings: totalSavings,
            excessiveCategories: anomalies,
            allCategories: allAnalysis,
            message: this.generateSummaryMessage(anomalies, totalSavings),
            recommendations
        };
    }

    /**
     * Groups transactions by category and calculates totals
     */
    private groupByCategory(transactions: BankStatementItem[]): Map<string, CategorySpending> {
        const categoryMap = new Map<string, CategorySpending>();

        transactions.forEach(transaction => {
            const existing = categoryMap.get(transaction.category);

            if (existing) {
                existing.totalAmount += transaction.amount;
                existing.transactionCount += 1;
            } else {
                categoryMap.set(transaction.category, {
                    category: transaction.category,
                    totalAmount: transaction.amount,
                    transactionCount: 1
                });
            }
        });

        return categoryMap;
    }

    /**
     * Retrieves historical averages (currently mocked, will be replaced with DB query)
     */
    private getHistoricalAverages(
        currentSpending: Map<string, CategorySpending>
    ): Map<string, number> {
        // TODO: Replace with actual database query
        // For now, return mock data and add any new categories from current spending
        const averages = new Map(this.mockHistoricalAverages);

        // For categories not in historical data, use current spending as baseline
        currentSpending.forEach((spending, category) => {
            if (!averages.has(category)) {
                averages.set(category, spending.totalAmount);
            }
        });

        return averages;
    }

    /**
     * Analyzes all categories against the 20% total spending rule
     */
    private analyzeCategories(
        currentSpending: Map<string, CategorySpending>,
        _historicalAverages?: Map<string, number>
    ): CategoryAnalysis[] {
        const analysisResults: CategoryAnalysis[] = [];
        const PERCENTAGE_LIMIT = 0.20; // 20% limit

        // 1. Calculate Total Spending
        let totalMonthlySpending = 0;
        currentSpending.forEach(spending => {
            totalMonthlySpending += spending.totalAmount;
        });

        // 2. Define Threshold (20% of Total)
        const thresholdAmount = totalMonthlySpending * PERCENTAGE_LIMIT;

        currentSpending.forEach((spending, category) => {
            const isExcessive = spending.totalAmount > thresholdAmount;

            // Calculate potential savings only if excessive
            const potentialSavings = isExcessive ? (spending.totalAmount - thresholdAmount) : 0;
            const percentageOfTotal = (spending.totalAmount / totalMonthlySpending) * 100;

            analysisResults.push({
                category,
                averageMonthlySpending: thresholdAmount, // Recommended Limit
                currentMonthSpending: spending.totalAmount,
                percentageChange: Math.round(percentageOfTotal * 100) / 100, // % of Total
                isExcessive: isExcessive,
                potentialSavings: Math.round(potentialSavings * 100) / 100
            });
        });

        // Sort by spending amount (highest first)
        return analysisResults.sort((a, b) => b.currentMonthSpending - a.currentMonthSpending);
    }

    /**
     * Generates user-friendly recommendations
     */
    private generateRecommendations(anomalies: CategoryAnalysis[]): string[] {
        return anomalies.map(anomaly => {
            const currency = 'TL';
            return `You spent ${anomaly.currentMonthSpending.toLocaleString()} ${currency} on ${anomaly.category} ` +
                `(${anomaly.percentageChange.toFixed(1)}% of total). ` +
                `This exceeds the recommended 20% limit (${anomaly.averageMonthlySpending.toLocaleString()} ${currency}). ` +
                `Potential saving: ${anomaly.potentialSavings.toLocaleString()} ${currency}.`;
        });
    }

    /**
     * Generates summary message
     */
    private generateSummaryMessage(anomalies: CategoryAnalysis[], totalSavings: number): string {
        if (anomalies.length === 0) {
            return '✅ Great job! Your spending is within normal patterns this month.';
        }

        const categoriesText = anomalies.length === 1
            ? '1 category'
            : `${anomalies.length} categories`;

        return `⚠️ Excessive consumption detected in ${categoriesText}. ` +
            `Total potential savings: ${totalSavings.toLocaleString()} TL`;
    }

    /**
     * Future method: Update historical averages with new data
     * This will be implemented when DB integration is complete
     */
    public async updateHistoricalData(transactions: BankStatementItem[]): Promise<void> {
        // TODO: Implement database update logic
        // Store monthly aggregates in database for future analysis
        console.log('Historical data update - To be implemented with DB integration');
    }
}
