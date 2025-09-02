
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { Expense } from './ExpenseForm';

interface ChartViewProps {
  expenses: Expense[];
}

const COLORS = [
  '#f97316', // orange for Food & Dining
  '#3b82f6', // blue for Transportation
  '#8b5cf6', // purple for Entertainment
  '#ec4899', // pink for Shopping
  '#ef4444', // red for Bills & Utilities
  '#22c55e', // green for Healthcare
  '#6b7280'  // gray for Other
];

export default function ChartView({ expenses }: ChartViewProps) {
  // Group expenses by category
  const categoryData = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryData).map(([category, amount]) => ({
    name: category,
    value: amount,
    percentage: ((amount / expenses.reduce((sum, exp) => sum + exp.amount, 0)) * 100).toFixed(1)
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.payload.name}</p>
          <p className="text-primary font-bold">${data.value.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">{data.payload.percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  if (expenses.length === 0) {
    return (
      <Card className="expense-card">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Expense Breakdown</h2>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-lg mb-2">No data to display</p>
          <p className="text-sm">Add some expenses to see your spending breakdown!</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="expense-card">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Expense Breakdown</h2>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 space-y-2">
        <h3 className="font-semibold mb-3">Category Breakdown</h3>
        {chartData.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-medium">{item.name}</span>
            </div>
            <div className="text-right">
              <div className="font-bold">${item.value.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">{item.percentage}%</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
