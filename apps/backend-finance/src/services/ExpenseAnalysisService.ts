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

        // Step 3: Detect anomalies (>20% excess spending)
        const anomalies = this.detectAnomalies(categorySpending, historicalAverages);

        // Step 4: Calculate total potential savings
        const totalSavings = anomalies.reduce((sum, a) => sum + a.potentialSavings, 0);

        // Step 5: Generate recommendations
        const recommendations = this.generateRecommendations(anomalies);

        return {
            analysisDate: new Date().toISOString(),
            totalPotentialSavings: totalSavings,
            excessiveCategories: anomalies,
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
     * Detects anomalies: spending >20% above historical average
     */
    private detectAnomalies(
        currentSpending: Map<string, CategorySpending>,
        historicalAverages: Map<string, number>
    ): CategoryAnalysis[] {
        const anomalies: CategoryAnalysis[] = [];
        const THRESHOLD_PERCENTAGE = 20; // 20% excess triggers anomaly

        currentSpending.forEach((spending, category) => {
            const average = historicalAverages.get(category) || spending.totalAmount;
            const percentageChange = ((spending.totalAmount - average) / average) * 100;
            const isExcessive = percentageChange > THRESHOLD_PERCENTAGE;

            if (isExcessive) {
                const potentialSavings = spending.totalAmount - average;

                anomalies.push({
                    category,
                    averageMonthlySpending: average,
                    currentMonthSpending: spending.totalAmount,
                    percentageChange: Math.round(percentageChange * 100) / 100,
                    isExcessive: true,
                    potentialSavings: Math.round(potentialSavings * 100) / 100
                });
            }
        });

        // Sort by potential savings (highest first)
        return anomalies.sort((a, b) => b.potentialSavings - a.potentialSavings);
    }

    /**
     * Generates user-friendly recommendations
     */
    private generateRecommendations(anomalies: CategoryAnalysis[]): string[] {
        return anomalies.map(anomaly => {
            const currency = 'TL'; // Default currency
            return `You spent ${anomaly.currentMonthSpending.toLocaleString()} ${currency} on ${anomaly.category}, ` +
                `usually you spend ${anomaly.averageMonthlySpending.toLocaleString()} ${currency}. ` +
                `Potential saving: ${anomaly.potentialSavings.toLocaleString()} ${currency} ` +
                `(+${anomaly.percentageChange.toFixed(1)}%)`;
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
