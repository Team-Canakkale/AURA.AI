import { useState, useEffect } from 'react';
import axios from 'axios';
import './ExpenseAnalyzer.css';
import PdfUploader from './PdfUploader';

interface Transaction {
    date: string;
    description: string;
    category: string;
    amount: number;
    currency: string;
}

interface ExpenseAnalyzerProps {
    onAnalyze: (transactions: Transaction[]) => void;
    loading: boolean;
}

function ExpenseAnalyzer({ onAnalyze, loading }: ExpenseAnalyzerProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [newTransaction, setNewTransaction] = useState<Transaction>({
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: 'Dining',
        amount: 0,
        currency: 'TRY'
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/finance/api/expense-categories');
            if (response.data.success) {
                setCategories(response.data.data.categories);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            // Fallback categories
            setCategories(['Dining', 'Transportation', 'Shopping', 'Entertainment', 'Utilities', 'Groceries', 'Healthcare', 'Education', 'Travel', 'Other']);
        }
    };

    const handlePdfTransactions = (pdfTransactions: Transaction[]) => {
        setTransactions(pdfTransactions);
    };

    const handleAddTransaction = () => {
        if (newTransaction.description && newTransaction.amount > 0) {
            setTransactions([...transactions, { ...newTransaction }]);
            setNewTransaction({
                date: new Date().toISOString().split('T')[0],
                description: '',
                category: newTransaction.category,
                amount: 0,
                currency: 'TRY'
            });
        }
    };

    const handleRemoveTransaction = (index: number) => {
        setTransactions(transactions.filter((_, i) => i !== index));
    };

    const handleAnalyze = () => {
        if (transactions.length > 0) {
            onAnalyze(transactions);
        }
    };

    const handleLoadSample = () => {
        const sampleTransactions: Transaction[] = [
            { date: '2025-02-01', description: 'Starbucks Coffee', category: 'Dining', amount: 150, currency: 'TRY' },
            { date: '2025-02-02', description: 'Uber Ride', category: 'Transportation', amount: 85, currency: 'TRY' },
            { date: '2025-02-03', description: 'Restaurant Dinner', category: 'Dining', amount: 450, currency: 'TRY' },
            { date: '2025-02-04', description: 'Cinema Ticket', category: 'Entertainment', amount: 120, currency: 'TRY' },
            { date: '2025-02-05', description: 'Lunch at Cafe', category: 'Dining', amount: 5000, currency: 'TRY' },
            { date: '2025-02-05', description: 'Online Shopping', category: 'Shopping', amount: 800, currency: 'TRY' },
        ];
        setTransactions(sampleTransactions);
    };

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="expense-analyzer">
            <div className="analyzer-header">
                <h2>📝 Add Transactions</h2>
                <button
                    className="sample-btn"
                    onClick={handleLoadSample}
                    disabled={loading}
                >
                    Load Sample Data
                </button>
            </div>

            {/* PDF Upload */}
            <PdfUploader onTransactionsExtracted={handlePdfTransactions} />

            {/* Manual Entry Divider */}
            <div className="divider">
                <span>OR</span>
            </div>

            {/* Add Transaction Form */}
            <div className="transaction-form">
                <div className="form-row">
                    <div className="form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            value={newTransaction.date}
                            onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <select
                            value={newTransaction.category}
                            onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                            disabled={loading}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group flex-2">
                        <label>Description</label>
                        <input
                            type="text"
                            placeholder="e.g., Coffee at Starbucks"
                            value={newTransaction.description}
                            onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTransaction()}
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Amount (₺)</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={newTransaction.amount || ''}
                            onChange={(e) => setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) || 0 })}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTransaction()}
                            disabled={loading}
                        />
                    </div>
                </div>

                <button
                    className="add-btn"
                    onClick={handleAddTransaction}
                    disabled={loading || !newTransaction.description || newTransaction.amount <= 0}
                >
                    <span className="btn-icon">+</span>
                    Add Transaction
                </button>
            </div>

            {/* Transactions List */}
            {transactions.length > 0 && (
                <div className="transactions-list">
                    <div className="list-header">
                        <h3>Transactions ({transactions.length})</h3>
                        <span className="total-amount">Total: ₺{totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <button
                        className="analyze-btn"
                        onClick={handleAnalyze}
                        disabled={loading}
                        style={{ marginBottom: '1rem' }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <span className="btn-icon">🔍</span>
                                Analyze Expenses
                            </>
                        )}
                    </button>

                    <div className="transactions-scroll">
                        {transactions.map((transaction, index) => (
                            <div key={index} className="transaction-item">
                                <div className="transaction-info">
                                    <div className="transaction-main">
                                        <span className="transaction-description">{transaction.description}</span>
                                        <span className="transaction-category">{transaction.category}</span>
                                    </div>
                                    <div className="transaction-details">
                                        <span className="transaction-date">
                                            {new Date(transaction.date).toLocaleDateString('tr-TR')}
                                        </span>
                                        <span className="transaction-amount">
                                            ₺{transaction.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    className="remove-btn"
                                    onClick={() => handleRemoveTransaction(index)}
                                    disabled={loading}
                                    title="Remove transaction"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExpenseAnalyzer;
