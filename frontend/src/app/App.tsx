import { useState } from "react";
import * as Papa from "papaparse";
import { FileUpload } from "./components/FileUpload";
import { InsightsDisplay, BiasInsight, TradeStats } from "./components/InsightsDisplay";
import { Activity } from "lucide-react";

interface Trade {
  date: string;
  symbol: string;
  action: string;
  quantity: number;
  price: number;
}

export default function App() {
  const [insights, setInsights] = useState<BiasInsight[] | null>(null);
  const [stats, setStats] = useState<TradeStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyzeTrades = (trades: Trade[]) => {
    // Calculate basic statistics
    const totalTrades = trades.length;
    const buys = trades.filter((t) => t.action.toLowerCase() === "buy");
    const sells = trades.filter((t) => t.action.toLowerCase() === "sell");

    // Calculate profits/losses (simplified)
    let profits: number[] = [];
    let losses: number[] = [];
    
    // Group trades by symbol to calculate P&L
    const symbolTrades: { [key: string]: Trade[] } = {};
    trades.forEach((trade) => {
      if (!symbolTrades[trade.symbol]) {
        symbolTrades[trade.symbol] = [];
      }
      symbolTrades[trade.symbol].push(trade);
    });

    // Simple P&L calculation
    Object.values(symbolTrades).forEach((symbolTradeList) => {
      let position = 0;
      let avgCost = 0;

      symbolTradeList.forEach((trade) => {
        if (trade.action.toLowerCase() === "buy") {
          avgCost = ((avgCost * position) + (trade.price * trade.quantity)) / (position + trade.quantity);
          position += trade.quantity;
        } else if (trade.action.toLowerCase() === "sell" && position > 0) {
          const pnl = (trade.price - avgCost) * Math.min(trade.quantity, position);
          if (pnl > 0) {
            profits.push(pnl);
          } else {
            losses.push(Math.abs(pnl));
          }
          position -= trade.quantity;
        }
      });
    });

    const winRate = profits.length > 0 ? (profits.length / (profits.length + losses.length)) * 100 : 0;
    const avgProfit = profits.length > 0 ? profits.reduce((a, b) => a + b, 0) / profits.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0;
    const profitFactor = avgLoss > 0 ? (avgProfit * profits.length) / (avgLoss * losses.length) : 0;

    const tradeStats: TradeStats = {
      totalTrades,
      winRate: parseFloat(winRate.toFixed(1)),
      avgProfit,
      avgLoss,
      profitFactor,
    };

    // Analyze biases
    const detectedBiases: BiasInsight[] = [];

    // 1. Loss Aversion Bias - holding losing positions too long
    if (avgLoss > avgProfit * 1.5) {
      detectedBiases.push({
        type: "Loss Aversion Bias",
        severity: "high",
        description: "Your average loss is significantly higher than your average profit, suggesting you may be holding onto losing positions too long.",
        recommendation: "Implement strict stop-loss rules and stick to them. Cut losses quickly and let winners run.",
        metric: Math.min(((avgLoss / avgProfit) * 50), 100),
      });
    }

    // 2. Overtrading Bias
    const tradesPerSymbol = trades.length / Object.keys(symbolTrades).length;
    if (tradesPerSymbol > 8) {
      detectedBiases.push({
        type: "Overtrading Bias",
        severity: "medium",
        description: `High trade frequency detected (${tradesPerSymbol.toFixed(1)} trades per symbol). This may indicate emotional trading or lack of strategy discipline.`,
        recommendation: "Focus on quality over quantity. Wait for high-probability setups and avoid impulsive trades.",
        metric: Math.min(tradesPerSymbol * 10, 100),
      });
    }

    // 3. Recency Bias - concentration of trades in recent period
    const sortedTrades = [...trades].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const recentTrades = sortedTrades.slice(-Math.floor(trades.length / 3));
    const recentConcentration = (recentTrades.length / trades.length) * 100;
    
    if (recentConcentration > 40) {
      detectedBiases.push({
        type: "Recency Bias",
        severity: "medium",
        description: "High concentration of trades in recent period may indicate reactive trading based on recent events.",
        recommendation: "Maintain consistent trading discipline. Avoid letting recent wins or losses dramatically change your strategy.",
        metric: recentConcentration,
      });
    }

    // 4. Confirmation Bias - repeatedly trading same symbols
    const symbolFrequency: { [key: string]: number } = {};
    trades.forEach((trade) => {
      symbolFrequency[trade.symbol] = (symbolFrequency[trade.symbol] || 0) + 1;
    });
    const maxFreq = Math.max(...Object.values(symbolFrequency));
    const concentration = (maxFreq / trades.length) * 100;

    if (concentration > 25) {
      detectedBiases.push({
        type: "Confirmation Bias",
        severity: "low",
        description: `Heavy focus on certain symbols (${concentration.toFixed(1)}% concentration) may indicate bias toward familiar assets.`,
        recommendation: "Diversify your analysis. Avoid tunnel vision on specific assets and explore opportunities across different sectors.",
        metric: concentration,
      });
    }

    // 5. Win Rate Analysis
    if (winRate < 40) {
      detectedBiases.push({
        type: "Strategy Effectiveness",
        severity: "high",
        description: `Win rate of ${winRate.toFixed(1)}% is below optimal levels, indicating potential strategy issues.`,
        recommendation: "Review your entry and exit criteria. Consider paper trading to refine your strategy before risking more capital.",
        metric: 100 - winRate,
      });
    }

    return { insights: detectedBiases, stats: tradeStats };
  };

  const handleFileSelect = (file: File) => {
    setIsLoading(true);
    setInsights(null);
    setStats(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const trades = results.data.map((row: any) => ({
            date: row.date,
            symbol: row.symbol,
            action: row.action,
            quantity: parseFloat(row.quantity),
            price: parseFloat(row.price),
          }));

          const { insights, stats } = analyzeTrades(trades);
          setInsights(insights);
          setStats(stats);
        } catch (error) {
          console.error("Error analyzing trades:", error);
          alert("Error analyzing trades. Please check your CSV format.");
        } finally {
          setIsLoading(false);
        }
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        alert("Error parsing CSV file. Please check the format.");
        setIsLoading(false);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500 p-2">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Trade Bias Detector</h1>
              <p className="text-gray-500 text-sm">
                Analyze your trading patterns and identify cognitive biases
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />

          {insights && stats && (
            <div className="animate-in fade-in duration-500">
              <InsightsDisplay insights={insights} stats={stats} />
            </div>
          )}

          {!insights && !isLoading && (
            <div className="text-center py-12 text-gray-500">
              <p>Upload a CSV file to get started with bias analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}