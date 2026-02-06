import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

interface TransactionInput {
    date: string;
    description: string;
    category: string;
    amount: number;
    currency: string;
}

export class TransactionController {

    /**
     * POST /api/transactions/bulk
     * Saves a list of transactions to the database
     */
    public saveBulkTransactions = async (req: Request, res: Response): Promise<void> => {
        try {
            const { transactions } = req.body;

            if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid request: transactions array is required and cannot be empty'
                });
                return;
            }

            // Prepare data for Supabase
            // Assuming the table 'transactions' exists and has columns matching our data
            const cleanTransactions = transactions.map((t: TransactionInput) => ({
                date: t.date,
                description: t.description,
                category: t.category,
                amount: t.amount,
                currency: t.currency,
                created_at: new Date().toISOString()
            }));

            // Insert into Supabase
            const { data, error } = await supabase
                .from('transactions')
                .insert(cleanTransactions)
                .select();

            if (error) {
                console.error('Supabase insert error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Failed to save transactions to database',
                    details: error.message
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: `Successfully saved ${data?.length || 0} transactions`,
                data: data
            });

        } catch (error: any) {
            console.error('Error saving transactions:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                details: error.message
            });
        }
    };

    /**
     * GET /api/transactions
     * Retrieves transactions from the database
     */
    public getTransactions = async (req: Request, res: Response): Promise<void> => {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false })
                .limit(100);

            if (error) {
                throw error;
            }

            res.status(200).json({
                success: true,
                data: data
            });
        } catch (error: any) {
            console.error('Error fetching transactions:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch transactions',
                details: error.message
            });
        }
    };
}
