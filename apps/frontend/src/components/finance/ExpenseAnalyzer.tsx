import { useState } from 'react';
import axios from 'axios';
import {
    Sparkles,
    Save,
    Trash2,
    CreditCard,
    Utensils,
    Bus,
    ShoppingBag,
    Plus,
    Loader2
} from 'lucide-react';
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

const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('food') || cat.includes('yemek') || cat.includes('market') || cat.includes('grocery')) return <Utensils className="w-4 h-4" />;
    if (cat.includes('uulaşım') || cat.includes('transport') || cat.includes('bus') || cat.includes('taxi') || cat.includes('akaryakıt')) return <Bus className="w-4 h-4" />;
    if (cat.includes('shop') || cat.includes('alışveriş') || cat.includes('giyim')) return <ShoppingBag className="w-4 h-4" />;
    return <CreditCard className="w-4 h-4" />;
};

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
                alert(`${response.data.message} başarıyla kaydedildi`);
            }
        } catch (error) {
            console.error('Failed to save transactions:', error);
            alert('İşlemler kaydedilemedi. Detaylar için konsola bakın.');
        }
    };

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-2 text-white font-bold text-lg">
                    <Plus className="w-5 h-5 text-violet-500" />
                    <h2>İşlem Girişi</h2>
                </div>
            </div>

            {/* PDF Upload */}
            <div className="bg-slate-800/40 rounded-xl p-1 border border-white/5">
                <PdfUploader onTransactionsExtracted={handlePdfTransactions} />
            </div>

            {/* Transactions List */}
            {transactions.length > 0 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex justify-between items-end">
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Tespit Edilen İşlemler</h3>
                            <p className="text-sm text-slate-400">{transactions.length} adet işlem bulundu</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Toplam Tutar</p>
                            <span className="text-xl font-mono font-bold text-white">₺{totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                            onClick={handleAnalyze}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            Harcamaları Analiz Et
                        </button>

                        <button
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                            onClick={handleSave}
                            disabled={loading}
                        >
                            <Save className="w-4 h-4" />
                            Veritabanına Kaydet
                        </button>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {transactions.map((transaction, index) => (
                            <div key={index} className="flex items-center justify-between p-3.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-slate-700 transition-colors">
                                        {getCategoryIcon(transaction.category)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white leading-tight mb-0.5">{transaction.description}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                                            <span>{transaction.category}</span>
                                            <span>•</span>
                                            <span>{new Date(transaction.date).toLocaleDateString('tr-TR')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="font-mono font-bold text-slate-200">
                                        ₺{transaction.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                    </span>
                                    <button
                                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                        onClick={() => handleRemoveTransaction(index)}
                                        disabled={loading}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExpenseAnalyzer;

