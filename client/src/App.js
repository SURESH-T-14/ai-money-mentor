import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { 
  LayoutDashboard, 
  CreditCard, 
  DollarSign, 
  Settings, 
  UserPlus, 
  LogIn, 
  LogOut, 
  ChevronDown,
  PlusCircle,
  TrendingUp,
  Target,
  Zap,
  Trash2
} from 'lucide-react';

// --- Shadcn/UI Component Recreations (using Tailwind) 
// We recreate the style of shadcn/ui components since we can't install them in a single file.

const cn = (...classes) => classes.filter(Boolean).join(' ');

// Currency formatter (INR)
const formatCurrency = (value) => {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
  } catch (e) {
    return `₹${Number(value).toFixed(2)}`;
  }
};

// Button
const Button = React.forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-slate-900 text-white hover:bg-slate-900/90',
    destructive: 'bg-red-600 text-white hover:bg-red-600/90',
    outline: 'border border-slate-200 hover:bg-slate-100',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-100/80',
    ghost: 'hover:bg-slate-100',
    link: 'text-slate-900 underline-offset-4 hover:underline',
  };
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

// Input
const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

// Label
const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
    {...props}
  />
));

// Card Components
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('rounded-lg border border-slate-200 bg-white text-slate-950 shadow-sm', className)}
    {...props}
  />
));

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
));

const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h3 ref={ref} className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props}>
    {children}
  </h3>
));

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-slate-500', className)} {...props} />
));

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
));

// Select Components
const Select = ({ children, onValueChange, value }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const selectRef = React.useRef(null);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const handleValueChange = (val) => {
    setSelectedValue(val);
    if (onValueChange) {
      onValueChange(val);
    }
    setIsOpen(false);
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectRef]);

  return (
    <div className="relative" ref={selectRef}>
      <SelectTrigger onClick={() => setIsOpen(!isOpen)}>
        <SelectValue placeholder="Select a category">
          {selectedValue ? selectedValue : "Select a category"}
        </SelectValue>
      </SelectTrigger>
      {isOpen && (
        <SelectContent>
          {React.Children.map(children, (child) =>
            React.cloneElement(child, { onSelect: handleValueChange })
          )}
        </SelectContent>
      )}
    </div>
  );
};

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
));

const SelectValue = ({ children }) => <span>{children}</span>;

const SelectContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white p-1 shadow-md',
      className
    )}
    {...props}
  />
));

const SelectItem = React.forwardRef(({ className, children, value, onSelect, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100',
      className
    )}
    onClick={() => onSelect(value)}
    {...props}
  >
    {children}
  </div>
));

// --- Mock Data --- 
const MOCK_USER = {
  id: 'u1',
  name: 'Satoshi Mehta',
  email: 'satoshimehta@example.com',
};

const MOCK_TRANSACTIONS = [
  { id: 't1', date: '2025-10-30', description: 'Coffee Shop', amount: 5.75, category: 'Food' },
  { id: 't2', date: '2025-10-29', description: 'Monthly Pass', amount: 65.00, category: 'Transport' },
  { id: 't3', date: '2025-10-28', description: 'Netflix', amount: 15.99, category: 'Entertainment' },
  { id: 't4', date: '2025-10-28', description: 'Groceries', amount: 120.50, category: 'Food' },
  { id: 't5', date: '2025-10-27', description: 'Dinner Out', amount: 75.20, category: 'Food' },
  { id: 't6', date: '2025-10-26', description: 'Gasoline', amount: 55.00, category: 'Transport' },
  { id: 't7', date: '2025-10-25', description: 'Movie Tickets', amount: 30.00, category: 'Entertainment' },
];

const MOCK_BUDGETS = {
  Food: { goal: 400, spent: 201.45 },
  Transport: { goal: 150, spent: 120.00 },
  Entertainment: { goal: 100, spent: 45.99 },
};

const MOCK_AI_INSIGHT = {
  title: "Food Spending Alert!",
  suggestion: "You've spent ₹201.45 on Food this month, which is 50% of your ₹400 budget. Try reducing dining out by 10% to stay on track."
};

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Health', 'Other'];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF00FF'];

// --- Auth Context ---
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock Login
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === 'test@example.com' && password === 'password123') {
          setUser(MOCK_USER);
          setLoading(false);
          resolve(true);
        } else {
          setError('Invalid email or password. (Hint: test@example.com / password123)');
          setLoading(false);
          resolve(false);
        }
      }, 1000);
    });
  };

  // Mock Register
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!name || !email || !password) {
          setError('All fields are required.');
          setLoading(false);
          resolve(false);
        } else {
          setUser({ ...MOCK_USER, name, email });
          setLoading(false);
          resolve(true);
        }
      }, 1000);
    });
  };

  // Mock Logout
  const logout = () => {
    setUser(null);
  };

  const value = { user, loading, error, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => useContext(AuthContext);

// --- Data Context (Mocking API calls) ---
const DataContext = createContext(null);

const DataProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [budgets, setBudgets] = useState(MOCK_BUDGETS);
  const [aiInsight, setAiInsight] = useState(MOCK_AI_INSIGHT);
  const [investments, setInvestments] = useState(() => {
    try {
      const raw = localStorage.getItem('aim_investments');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  // Recalculate budget 'spent' based on transactions
  useEffect(() => {
    setBudgets(prevBudgets => {
      const newBudgets = JSON.parse(JSON.stringify(prevBudgets)); // Deep copy
      // Reset spent
      for (const category in newBudgets) {
        newBudgets[category].spent = 0;
      }
      // Recalculate
      transactions.forEach(t => {
        if (newBudgets[t.category]) {
          newBudgets[t.category].spent += t.amount;
        } else {
          // If category exists in transaction but not budget, create it
          if(!newBudgets[t.category]) {
            newBudgets[t.category] = { goal: 0, spent: t.amount };
          }
        }
      });
      return newBudgets;
    });
  }, [transactions]);

  const addTransaction = (transaction) => {
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      const newTransaction = { ...transaction, id: `t${Math.random()}` };
      setTransactions(prev => [newTransaction, ...prev]);
      setLoading(false);
    }, 500);
  };
  
  const deleteTransaction = (id) => {
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      setTransactions(prev => prev.filter(t => t.id !== id));
      setLoading(false);
    }, 500);
  };
  // Add or update goals for budgets
  const addGoal = (category, goalAmount) => {
    setLoading(true);
    setTimeout(() => {
      setBudgets(prev => {
        const existing = prev[category] || { goal: 0, spent: 0 };
        return { ...prev, [category]: { ...existing, goal: Number(goalAmount) } };
      });
      setLoading(false);
    }, 300);
  };

  const updateGoal = (category, goalAmount) => {
    // For this mock, update is same as addGoal
    addGoal(category, goalAmount);
  };

  // Investments management (persisted to localStorage)
  useEffect(() => {
    try {
      localStorage.setItem('aim_investments', JSON.stringify(investments));
    } catch (e) {
      // ignore
    }
  }, [investments]);

  const addInvestment = ({ name, value }) => {
    setLoading(true);
    setTimeout(() => {
      const inv = { id: `i${Math.random().toString(36).slice(2,9)}`, name, value: Number(value) };
      setInvestments(prev => [inv, ...prev]);
      setLoading(false);
    }, 300);
  };

  const deleteInvestment = (id) => {
    setLoading(true);
    setTimeout(() => {
      setInvestments(prev => prev.filter(i => i.id !== id));
      setLoading(false);
    }, 200);
  };
  
  const value = { transactions, budgets, aiInsight, loading, addTransaction, deleteTransaction, addGoal, updateGoal, investments, addInvestment, deleteInvestment };
  
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

const useData = () => useContext(DataContext);


// --- Pages ---

// Auth Page (Login / Register)
function AuthPage({ setPage }) {
  const [isLogin, setIsLogin] = useState(true);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin ? 'Sign in to access your dashboard.' : 'Enter your details to get started.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLogin ? <LoginForm setPage={setPage} /> : <RegisterForm setPage={setPage} />}
        </CardContent>
        <CardFooter className="flex-col">
          <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function LoginForm({ setPage }) {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      setPage('dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>
    </form>
  );
}

function RegisterForm({ setPage }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, loading, error } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(name, email, password);
    if (success) {
      setPage('dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Satoshi Mehta" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
       {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
}

// Main Application Layout
function AppLayout({ page, setPage }) {
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    setPage('login');
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-100">
      {/* Sidebar Navigation */}
      <aside className="hidden w-64 flex-col border-r bg-white p-4 sm:flex">
        <h1 className="mb-8 text-2xl font-bold text-slate-900">AI Money Mentor</h1>
        <nav className="flex flex-col space-y-2">
          <Button
            variant={page === 'dashboard' ? 'secondary' : 'ghost'}
            className="justify-start"
            onClick={() => setPage('dashboard')}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
          </Button>
          <Button
            variant={page === 'transactions' ? 'secondary' : 'ghost'}
            className="justify-start"
            onClick={() => setPage('transactions')}
          >
            <CreditCard className="mr-2 h-4 w-4" /> Transactions
          </Button>
          <Button
            variant={page === 'investments' ? 'secondary' : 'ghost'}
            className="justify-start"
            onClick={() => setPage('investments')}
          >
            <TrendingUp className="mr-2 h-4 w-4" /> Investments
          </Button>
          <Button
            variant={page === 'goals' ? 'secondary' : 'ghost'}
            className="justify-start"
            onClick={() => setPage('goals')}
          >
            <Target className="mr-2 h-4 w-4" /> Goals
          </Button>
        </nav>
        <div className="mt-auto flex flex-col space-y-2">
           <div className="p-2 text-sm text-slate-700">
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <Button variant="outline" className="justify-start" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8">
        {page === 'dashboard' && <DashboardPage />}
        {page === 'transactions' && <TransactionsPage />}
        {page === 'investments' && <InvestmentsPage />}
        {page === 'goals' && <GoalsPage />}
      </main>
    </div>
  );
}

// Dashboard Page
function DashboardPage() {
  const { budgets, transactions, aiInsight } = useData();
  const { user } = useAuth();

  const totalSpent = useMemo(() => 
    transactions.reduce((acc, t) => acc + t.amount, 0),
  [transactions]);
  
  const totalBudget = useMemo(() =>
    Object.values(budgets).reduce((acc, b) => acc + b.goal, 0),
  [budgets]);

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-3xl font-bold text-slate-900">Welcome back, {user.name.split(' ')[0]}!</h2>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">Total Spent (Oct)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totalSpent)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">Total Budget (Oct)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totalBudget)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-500">Remaining Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totalBudget - totalSpent)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Insights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Spending Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ExpenseChart />
          </CardContent>
        </Card>
        
        {/* AI Advisor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="mr-2 h-5 w-5 text-yellow-500" />
              AI Advisor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <p className="text-lg font-semibold">{aiInsight.title}</p>
             <p className="text-sm text-slate-600">{aiInsight.suggestion}</p>
             <Button variant="outline" className="w-full">
               See All Insights
             </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Budget Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Goals</CardTitle>
          <CardDescription>Your monthly spending goals.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(budgets).map(([category, data]) => (
            <BudgetTracker key={category} category={category} spent={data.spent} goal={data.goal} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function BudgetTracker({ category, spent, goal }) {
  const percentage = goal > 0 ? (spent / goal) * 100 : 0;
  let progressBarColor = 'bg-blue-600';
  if (percentage > 90) progressBarColor = 'bg-red-600';
  else if (percentage > 75) progressBarColor = 'bg-yellow-500';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm font-medium">
        <span className="text-slate-700">{category}</span>
        <span className="text-slate-500">
          {formatCurrency(spent)} / <span className="text-slate-700">{formatCurrency(goal)}</span>
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-200">
        <div
          className={cn('h-2 rounded-full transition-all duration-500', progressBarColor)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

function ExpenseChart() {
  const { transactions } = useData();

  const data = useMemo(() => {
    const categoryTotals = transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  }, [transactions]);
  
  const categoryColors = useMemo(() => {
    const colorMap = {};
    CATEGORIES.forEach((cat, index) => {
      colorMap[cat] = COLORS[index % COLORS.length];
    });
    return colorMap;
  }, []);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={categoryColors[entry.name] || COLORS[index % COLORS.length]} />
          ))}
        </Pie>
  <Tooltip formatter={(value) => formatCurrency(value)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}


// Transactions Page
function TransactionsPage() {
  const { transactions, addTransaction, deleteTransaction, loading } = useData();
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Transactions</h2>
        {/* AddTransactionForm will be here, perhaps in a Modal */}
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50">
                    <div className="flex items-center space-x-3">
                       <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                         <CreditCard className="h-5 w-5 text-slate-600" />
                       </span>
                       <div>
                         <p className="font-medium">{t.description}</p>
                         <p className="text-sm text-slate-500">{t.date} &middot; {t.category}</p>
                       </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="font-medium">-{formatCurrency(t.amount)}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={() => deleteTransaction(t.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <AddTransactionForm />
        </div>
      </div>
    </div>
  );
}


// Investments Page (simple placeholder)
function InvestmentsPage() {
  const { investments, addInvestment, deleteInvestment } = useData();
  const [name, setName] = useState('');
  const [value, setValue] = useState('');

  const total = investments.reduce((acc, i) => acc + Number(i.value || 0), 0);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name || !value) return;
    addInvestment({ name, value: Number(value) });
    setName('');
    setValue('');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Investments</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Overview</CardTitle>
              <CardDescription>Holdings added by you.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{formatCurrency(total)}</p>
              <div className="mt-4 space-y-2">
                {investments.length === 0 && (
                  <p className="text-sm text-slate-500">No investments yet. Use the form to add one.</p>
                )}
                {investments.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{inv.name}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-slate-700">{formatCurrency(inv.value)}</div>
                      <Button variant="ghost" size="icon" onClick={() => deleteInvestment(inv.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Add Investment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Index Fund" />
                </div>
                <div className="space-y-2">
                  <Label>Value (INR)</Label>
                  <Input type="number" step="0.01" min="0" value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. 10000" />
                </div>
                <Button type="submit" className="w-full">Add Investment</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


// Goals Page
function GoalsPage() {
  const { budgets, addGoal, updateGoal } = useData();
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [goalAmount, setGoalAmount] = useState('');
  const [message, setMessage] = useState('');

  const handleAddOrUpdate = (e) => {
    e.preventDefault();
    if (!selectedCategory || !goalAmount) return;
    addGoal(selectedCategory, Number(goalAmount));
    setMessage(`Goal set for ${selectedCategory} to ${formatCurrency(Number(goalAmount))}`);
    setGoalAmount('');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Goals</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Current Goals</CardTitle>
              <CardDescription>Manage monthly spending goals per category.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(budgets).map(([category, data]) => (
                <div key={category} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50">
                  <div>
                    <p className="font-medium">{category}</p>
                    <p className="text-sm text-slate-500">Spent: {formatCurrency(data.spent)}</p>
                  </div>
                  <div className="text-slate-700">Goal: {formatCurrency(data.goal)}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Add / Update Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddOrUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                    {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Monthly Goal (INR)</Label>
                  <Input type="number" step="0.01" min="0" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} placeholder="e.g. 5000" />
                </div>
                <Button type="submit" className="w-full">Set Goal</Button>
                {message && <p className="text-sm text-green-600">{message}</p>}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AddTransactionForm() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const { addTransaction, loading } = useData();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount || !date || !category) {
      // Simple validation
      return;
    }
    
    addTransaction({
      description,
      amount: parseFloat(amount),
      date,
      category
    });
    
    // Reset form
    setDescription('');
    setAmount('');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Coffee" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={setCategory} value={category}>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Adding...' : 'Add Transaction'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


// --- Main App Component ---
function App() {
  // 'login', 'register', 'dashboard', 'transactions'
  const [page, setPage] = useState('login');
  const { user } = useAuth();

  // Simple router
  const renderPage = () => {
    if (!user) {
      return <AuthPage setPage={setPage} />;
    }
    
    // Protected routes
    switch (page) {
      case 'dashboard':
        return <AppLayout page={page} setPage={setPage} />;
      case 'transactions':
        return <AppLayout page={page} setPage={setPage} />;
      case 'investments':
        return <AppLayout page={page} setPage={setPage} />;
      case 'goals':
        return <AppLayout page={page} setPage={setPage} />;
      default:
        // Unknown page — fall back to AppLayout (keeps current page value)
        return <AppLayout page={page} setPage={setPage} />;
    }
  };

  return <div className="font-sans">{renderPage()}</div>;
}

// (formatCurrency moved to top of file)

// Final wrapper to provide all contexts
const Root = () => (
  <AuthProvider>
    <DataProvider>
      <App />
    </DataProvider>
  </AuthProvider>
);

// In a real CRA/Next app, you'd export 'App' and render 'Root' in index.js
// For this single-file preview, we'll export Root as the default.
// export default Root; 
// Re-exporting App as default for standard React convention.
export default Root;