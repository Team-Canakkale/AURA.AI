import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    LayoutDashboard,
    LogOut,
    MessageSquare,
    ArrowLeft,
    TrendingUp,
    AlertTriangle,
    PieChart,
    Calendar
} from 'lucide-react';
import TusuChatWidget from '../components/finance/TusuChatWidget';
import ExpenseAnalyzer from '../components/finance/ExpenseAnalyzer';

interface Transaction {
    date: string;
    description: string;
    category: string;
    amount: number;
    currency: string;
}

interface CategoryAnalysis {
    category: string;
    averageMonthlySpending: number;
    currentMonthSpending: number;
    percentageChange: number;
    isExcessive: boolean;
    potentialSavings: number;
    recommendation?: {
        asset: string;
        trend: string;
        estimatedGain: number;
        message: string;
    };
}

interface AnalysisResult {
    analysisDate: string;
    totalPotentialSavings: number;
    excessiveCategories: CategoryAnalysis[];
    allCategories: CategoryAnalysis[];
    message: string;
    recommendations: string[];
}

function FinanceDashboard() {
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showChat, setShowChat] = useState(false);

    const handleAnalyze = async (newTransactions: Transaction[]) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/finance/api/analyze-expenses', {
                transactions: newTransactions
            });

            if (response.data.success) {
                setAnalysisResult(response.data.data);
            } else {
                setError('Analiz başarısız oldu. Lütfen tekrar deneyin.');
            }
        } catch (err: any) {
            console.error('Analysis error:', err);
            setError(err.response?.data?.error || 'Harcamalar analiz edilemedi. Backend servisinin çalıştığından emin olun.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0c10] text-slate-200 selection:bg-violet-500/30 font-sans relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />

            <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0c10]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <TrendingUp className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-white">AURA Finance</h1>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Smart Ecosystem</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-sm font-medium"
                            onClick={() => navigate('/')}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Ana Sayfa
                        </button>
                        <button
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all text-sm font-medium"
                            onClick={() => setShowChat(!showChat)}
                        >
                            <MessageSquare className="w-4 h-4 text-violet-400" />
                            Lumi ile Konuş
                        </button>
                        <button
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = '/';
                            }}
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-10 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column - Expense Analyzer */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6">
                            <ExpenseAnalyzer onAnalyze={handleAnalyze} loading={loading} />
                        </div>

                        {error && (
                            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Results */}
                    <div className="lg:col-span-5 space-y-6">
                        {analysisResult ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                {/* Summary Card */}
                                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8 overflow-hidden relative">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <h2 className="text-xl font-bold text-white mb-1">Analiz Özeti</h2>
                                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(analysisResult.analysisDate).toLocaleDateString('tr-TR')}
                                            </div>
                                        </div>
                                        <div className="p-3 bg-violet-600/10 rounded-xl">
                                            <PieChart className="w-6 h-6 text-violet-400" />
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-2">Toplam Potansiyel Tasarruf</p>
                                        <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-tighter">
                                            ₺{analysisResult.totalPotentialSavings.toLocaleString('tr-TR', {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0
                                            })}
                                        </span>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 mb-6">
                                        <p className="text-slate-200 leading-relaxed text-sm italic">"{analysisResult.message}"</p>
                                    </div>

                                    {analysisResult.recommendations.length > 0 && (
                                        <div className="space-y-3">
                                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hızlı İpuçları</h3>
                                            <div className="space-y-2">
                                                {analysisResult.recommendations.map((rec, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 p-3 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 rounded-lg transition-colors group">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 transition-transform group-hover:scale-150" />
                                                        <span className="text-sm text-slate-300">{rec}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Excessive Categories */}
                                {analysisResult.excessiveCategories.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 px-2">
                                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                            <h2 className="font-bold text-white">İyileştirme Alanları</h2>
                                        </div>
                                        {analysisResult.excessiveCategories.map((category, idx) => (
                                            <div key={idx} className="group bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:border-yellow-500/30 transition-all rounded-2xl p-6 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="font-bold text-lg text-white">{category.category}</h3>
                                                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold rounded-full border border-yellow-500/20">
                                                        %{category.percentageChange} Pay
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Önerilen Limit</p>
                                                        <p className="text-sm font-mono text-slate-300">₺{category.averageMonthlySpending.toLocaleString('tr-TR')}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Harcanan</p>
                                                        <p className="text-sm font-mono text-red-400">₺{category.currentMonthSpending.toLocaleString('tr-TR')}</p>
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl text-xs text-yellow-200/80 leading-relaxed">
                                                    Bu kategoride limitinizi <strong className="text-yellow-400">₺{category.potentialSavings.toLocaleString('tr-TR')}</strong> aştınız. Tasarruf için bütçenizi kontrol edin.
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-slate-900/40 backdrop-blur-xl border border-dashed border-white/10 rounded-2xl">
                                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                    <LayoutDashboard className="w-10 h-10 text-slate-600" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Henüz Analiz Yok</h3>
                                <p className="text-slate-400 max-w-[280px]">İşlemlerinizi ekleyin ve akıllı finansal analizler için taramaya başlayın.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Chat Widget */}
            {showChat && (
                <TusuChatWidget
                    onClose={() => setShowChat(false)}
                    contextData={analysisResult}
                />
            )}
        </div>
    );
}

export default FinanceDashboard;

