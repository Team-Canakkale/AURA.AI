import { useState } from 'react';
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

    const handlePdfTransactions = (pdfTransactions: Transaction[]) => {
        setTransactions(pdfTransactions);
    };

    const handleRemoveTransaction = (index: number) => {
        setTransactions(transactions.filter((_, i) => i !== index));
    };

    const handleAnalyze = () => {
        if (transactions.length > 0) {
            onAnalyze(transactions);
        }
    };

    const handleSave = async () => {
        if (transactions.length === 0) return;

        try {
            const response = await axios.post('/api/finance/api/transactions/bulk', {
                transactions
            });

            if (response.data.success) {
                alert(`Successfully saved ${response.data.message}`);
            }
        } catch (error) {
            console.error('Failed to save transactions:', error);
            alert('Failed to save transactions. Check console for details.');
        }
    };

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="expense-analyzer">
            <div className="analyzer-header">
                <h2>📝 Add Transactions</h2>
            </div>

            {/* PDF Upload */}
            <PdfUploader onTransactionsExtracted={handlePdfTransactions} />

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

                    <button
                        className="save-btn"
                        onClick={handleSave}
                        disabled={loading}
                        style={{ marginBottom: '1rem', marginLeft: '0.5rem', backgroundColor: '#4caf50' }}
                    >
                        <span className="btn-icon">💾</span>
                        Save to Database
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
