/**
 * TUSU Recommendation Engine
 * 
 * Provides investment recommendations based on savings opportunities
 * by analyzing market trends and suggesting optimal asset allocations.
 */

import { InvestmentRecommendation } from '../types/expense.types';

interface MarketAsset {
    name: string;
    trend: number; // Percentage change
}

export class RecommendationService {
    /**
     * Fetches market data - hybrid approach with real and mock data
     * Real: USD/TRY from exchange rate API
     * Mock: Gold, Tech Funds, Sustainable Energy (until integrated with financial APIs)
     */
    private async fetchMarketData(): Promise<MarketAsset[]> {
        let usdTryTrend = 0.1; // Fallback value

        try {
            // Fetch real USD/TRY exchange rate
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');

            if (response.ok) {
                const data: any = await response.json();
                const tryRate = data.rates?.TRY;

                if (tryRate) {
                    // Calculate trend (simulate small change for demo)
                    // In production, you'd compare with previous day's rate
                    usdTryTrend = Math.random() * 1 - 0.5; // Random between -0.5% to +0.5%
                    console.log(`✓ Real USD/TRY rate fetched: ${tryRate.toFixed(2)} (trend: ${usdTryTrend.toFixed(2)}%)`);
                }
            }
        } catch (error) {
            console.warn('⚠️ Failed to fetch USD/TRY rate, using fallback:', error);
        }

        return [
            { name: 'Gold', trend: 1.2 },
            { name: 'Tech Funds', trend: 5.0 },
            { name: 'Sustainable Energy', trend: 3.4 },
            { name: 'USD/TRY', trend: usdTryTrend }
        ];
    }

    /**
     * Analyzes market data and identifies the top-performing asset
     * @returns The asset with the highest positive trend
     */
    public async getTopPerformingAsset(): Promise<MarketAsset> {
        const marketData = await this.fetchMarketData();

        // Find asset with maximum trend
        const topAsset = marketData.reduce((max: MarketAsset, asset: MarketAsset) =>
            asset.trend > max.trend ? asset : max
        );

        return topAsset;
    }

    /**
     * Generates personalized investment recommendation
     * @param savedAmount - Amount saved from reducing expenses
     * @param expenseCategory - Category where savings were identified
     * @returns Investment recommendation with estimated gains
     */
    public async generateRecommendation(
        savedAmount: number,
        expenseCategory: string
    ): Promise<InvestmentRecommendation> {
        const topAsset = await this.getTopPerformingAsset();

        // Calculate estimated gain based on asset trend
        const estimatedGain = Math.round(savedAmount * (topAsset.trend / 100) * 100) / 100;

        // Generate Turkish message
        const message = `${expenseCategory} harcamandan artırdığın ${savedAmount.toLocaleString()} TL'yi ` +
            `'${topAsset.name}' fonuna yatırsaydın, şu an %${topAsset.trend} değer kazanabilirdin ` +
            `(Tahmini kazanç: ${estimatedGain.toLocaleString()} TL).`;

        return {
            asset: topAsset.name,
            trend: `+${topAsset.trend}%`,
            estimatedGain,
            message
        };
    }

    /**
     * Future method: Fetch real-time market data from external API
     * This will replace the mock data when integrated with a financial data provider
     */
    public async fetchRealTimeMarketData(): Promise<MarketAsset[]> {
        // TODO: Implement integration with financial API (e.g., Alpha Vantage, Yahoo Finance)
        console.log('Real-time market data - To be implemented with API integration');
        return this.fetchMarketData();
    }
}
