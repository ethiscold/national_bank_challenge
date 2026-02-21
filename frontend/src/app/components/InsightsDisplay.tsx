import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

export interface BiasInsight {
  type: string;
  severity: "low" | "medium" | "high";
  description: string;
  recommendation: string;
  metric: number;
}

export interface TradeStats {
  totalTrades: number;
  winRate: number;
  avgProfit: number;
  avgLoss: number;
  profitFactor: number;
}

interface InsightsDisplayProps {
  insights: BiasInsight[];
  stats: TradeStats;
}

export function InsightsDisplay({ insights, stats }: InsightsDisplayProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Trade Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Trade Statistics</CardTitle>
          <CardDescription>Overview of your trading performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <BarChart3 className="w-4 h-4" />
                <span>Total Trades</span>
              </div>
              <div className="font-semibold text-2xl">{stats.totalTrades}</div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <TrendingUp className="w-4 h-4" />
                <span>Win Rate</span>
              </div>
              <div className="font-semibold text-2xl">{stats.winRate}%</div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span>Avg Profit</span>
              </div>
              <div className="font-semibold text-2xl text-green-600">
                ${stats.avgProfit.toFixed(2)}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span>Avg Loss</span>
              </div>
              <div className="font-semibold text-2xl text-red-600">
                ${stats.avgLoss.toFixed(2)}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <BarChart3 className="w-4 h-4" />
                <span>Profit Factor</span>
              </div>
              <div className="font-semibold text-2xl">{stats.profitFactor.toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bias Insights */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Detected Biases</h2>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-orange-50 p-2 mt-1">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{insight.type}</CardTitle>
                        <Badge variant={getSeverityBadgeVariant(insight.severity)}>
                          {insight.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {insight.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Bias Indicator</span>
                    <span className="font-medium">{insight.metric}%</span>
                  </div>
                  <Progress value={insight.metric} className="h-2" />
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm">
                    <span className="font-semibold">Recommendation: </span>
                    {insight.recommendation}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
