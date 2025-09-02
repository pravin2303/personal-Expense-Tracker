
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import ExpenseForm, { Expense } from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import ExpenseSummary from '@/components/ExpenseSummary';
import ChartView from '@/components/ChartView';
import DarkModeToggle from '@/components/DarkModeToggle';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expense-tracker-expenses', []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const addExpense = (expenseData: Omit<Expense, 'id' | 'userId'>) => {
    if (!user) return;
    
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
      userId: user.id
    };

    setExpenses(prev => [newExpense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  // Filter expenses for current user
  const userExpenses = expenses.filter(expense => expense.userId === user?.id);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Expensely</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user.username}!</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DarkModeToggle />
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Summary Cards */}
        <ExpenseSummary expenses={userExpenses} />

        {/* Add Expense Form */}
        <ExpenseForm onAddExpense={addExpense} userId={user.id} />

        {/* Charts and List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartView expenses={userExpenses} />
          <ExpenseList expenses={userExpenses} onDeleteExpense={deleteExpense} />
        </div>
      </main>
    </div>
  );
}
