'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { truthCheckerApi } from '@/lib/api';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  Activity, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface UsageHistoryData {
  period: {
    start_date: string;
    end_date: string;
    days: number;
  };
  daily_usage: Array<{
    date: string;
    requests: number;
    credits_consumed: number;
    hours_consumed: number;
    processing_time: number;
  }>;
  action_breakdown: Array<{
    action_type: string;
    count: number;
    credits_consumed: number;
    hours_consumed: number;
  }>;
  summary: {
    total_requests: number;
    total_hours: number;
    avg_processing_time: number;
    most_used_action: string | null;
  };
}

interface UsageAnalyticsChartProps {
  className?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function UsageAnalyticsChart({ className }: UsageAnalyticsChartProps) {
  const [data, setData] = useState<UsageHistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30);

  useEffect(() => {
    loadUsageHistory();
  }, [selectedPeriod]);

  const loadUsageHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const historyData = await truthCheckerApi.getUserUsageHistory(selectedPeriod);
      setData(historyData);
    } catch (err) {
      setError('Failed to load usage history');
      toast.error('Failed to load usage analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatActionType = (actionType: string) => {
    return actionType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-muted-foreground">
            <LoadingSpinner size="sm" />
            <span>Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className={className}>
        <CardContent className="py-6">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive" />
            <p className="text-muted-foreground">{error || 'No data available'}</p>
            <Button onClick={loadUsageHistory} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Usage Analytics
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={selectedPeriod === 7 ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(7)}
              >
                7 Days
              </Button>
              <Button
                variant={selectedPeriod === 30 ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(30)}
              >
                30 Days
              </Button>
              <Button
                variant={selectedPeriod === 90 ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(90)}
              >
                90 Days
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="timeline" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="timeline">Usage Timeline</TabsTrigger>
              <TabsTrigger value="breakdown">Action Breakdown</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            {/* Timeline Chart */}
            <TabsContent value="timeline" className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.daily_usage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={(value) => formatDate(value as string)}
                      formatter={(value, name) => [value, name === 'requests' ? 'Requests' : 'Credits']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="requests" 
                      stroke="#0088FE" 
                      strokeWidth={2}
                      name="Daily Requests"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="credits_consumed" 
                      stroke="#00C49F" 
                      strokeWidth={2}
                      name="Credits Used"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            {/* Action Breakdown */}
            <TabsContent value="breakdown" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="h-64">
                  <h4 className="text-sm font-medium mb-2">Actions by Count</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.action_breakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ action_type, percent }) => 
                          `${formatActionType(action_type)} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {data.action_breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div className="h-64">
                  <h4 className="text-sm font-medium mb-2">Credits by Action Type</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.action_breakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="action_type" 
                        tickFormatter={formatActionType}
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value, name) => [value, 'Credits']}
                        labelFormatter={formatActionType}
                      />
                      <Bar dataKey="credits_consumed" fill="#FFBB28" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            {/* Performance Chart */}
            <TabsContent value="performance" className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.daily_usage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={(value) => formatDate(value as string)}
                      formatter={(value, name) => [
                        `${parseFloat(value as string).toFixed(2)}${name === 'processing_time' ? 's' : 'h'}`, 
                        name === 'processing_time' ? 'Avg Processing Time' : 'Hours Used'
                      ]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="hours_consumed" 
                      stroke="#FF8042" 
                      strokeWidth={2}
                      name="Hours Used"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="processing_time" 
                      stroke="#8884D8" 
                      strokeWidth={2}
                      name="Processing Time (s)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>

          {/* Summary Stats */}
          {data.summary && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {data.summary.total_requests}
                </div>
                <div className="text-xs text-muted-foreground">Total Requests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {data.summary.total_hours.toFixed(1)}h
                </div>
                <div className="text-xs text-muted-foreground">Hours Consumed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {data.summary.avg_processing_time.toFixed(1)}s
                </div>
                <div className="text-xs text-muted-foreground">Avg Processing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {data.summary.most_used_action ? 
                    formatActionType(data.summary.most_used_action).split(' ')[0] : 
                    'N/A'
                  }
                </div>
                <div className="text-xs text-muted-foreground">Top Action</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
} 