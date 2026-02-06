/**
 * TUSU Expense Analysis Controller
 * 
 * Handles HTTP requests for expense analysis
 */

import { Request, Response } from 'express';
import { ExpenseAnalysisService } from '../services/ExpenseAnalysisService';
import { RecommendationService } from '../services/RecommendationService';
import { AnalyzeExpensesRequest, BankStatementItem } from '../types/expense.types';

export class ExpenseAnalysisController {
    private service: ExpenseAnalysisService;
    private recommendationService: RecommendationService;

    constructor() {
        this.service = new ExpenseAnalysisService();
        this.recommendationService = new RecommendationService();
    }

    /**
     * POST /api/analyze-expenses
     * Analyzes expense transactions and detects anomalies
     */
    public analyzeExpenses = async (req: Request, res: Response): Promise<void> => {
        try {
            const requestData: AnalyzeExpensesRequest = req.body;

            // Validation
            if (!requestData.transactions || !Array.isArray(requestData.transactions)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid request: transactions array is required'
                });
                return;
            }

            if (requestData.transactions.length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid request: transactions array cannot be empty'
                });
                return;
            }

            // Validate transaction structure
            const isValid = this.validateTransactions(requestData.transactions);
            if (!isValid) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid transaction format. Required fields: date, description, category, amount, currency'
                });
                return;
            }

            // Convert date strings to Date objects
            const transactions: BankStatementItem[] = requestData.transactions.map(t => ({
                ...t,
                date: new Date(t.date)
            }));

            // Perform analysis
            const result = this.service.analyzeExpenses(transactions);

            // Generate investment recommendations for excessive categories (in parallel)
            await Promise.all(
                result.excessiveCategories.map(async (category) => {
                    const recommendation = await this.recommendationService.generateRecommendation(
                        category.potentialSavings,
                        category.category
                    );
                    category.recommendation = recommendation;
                })
            );

            // Return results
            res.status(200).json({
                success: true,
                data: result
            });

        } catch (error: any) {
            console.error('Error analyzing expenses:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error during expense analysis',
                details: error.message
            });
        }
    };

    /**
     * Validates transaction data structure
     */
    private validateTransactions(transactions: any[]): boolean {
        return transactions.every(t =>
            t.date !== undefined &&
            t.description !== undefined &&
            t.category !== undefined &&
            t.amount !== undefined &&
            typeof t.amount === 'number' &&
            t.currency !== undefined
        );
    }

    /**
     * GET /api/expense-categories
     * Returns list of available expense categories (for frontend)
     */
    public getCategories = async (req: Request, res: Response): Promise<void> => {
        try {
            const categories = [
                'Dining',
                'Transportation',
                'Shopping',
                'Entertainment',
                'Utilities',
                'Groceries',
                'Healthcare',
                'Education',
                'Travel',
                'Other'
            ];

            res.status(200).json({
                success: true,
                data: { categories }
            });

        } catch (error: any) {
            console.error('Error fetching categories:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                details: error.message
            });
        }
    };
}
