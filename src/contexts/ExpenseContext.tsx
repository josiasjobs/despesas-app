
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  color: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

interface Expense {
  id: string;
  amount: number;
  date: string;
  subcategoryId: string;
  categoryId: string;
}

interface ExpenseContextType {
  categories: Category[];
  expenses: Expense[];
  addCategory: (name: string) => void;
  deleteCategory: (id: string) => void;
  addSubcategory: (name: string, categoryId: string) => void;
  deleteSubcategory: (id: string) => void;
  addExpense: (amount: number, date: string, subcategoryId: string, categoryId: string) => void;
  deleteExpense: (id: string) => void;
  updateExpense: (id: string, amount: number, date: string, subcategoryId: string, categoryId: string) => void;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
  getSubcategory: (id: string) => Subcategory | undefined;
  getCategory: (id: string) => Category | undefined;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const STORAGE_KEY = 'expense_tracker_data';

const defaultCategories: Category[] = [
  {
    id: '1',
    name: 'Alimentação',
    color: '#10B981',
    subcategories: [
      { id: '1-1', name: 'Mercado', categoryId: '1' },
      { id: '1-2', name: 'Restaurante', categoryId: '1' },
      { id: '1-3', name: 'Bebida', categoryId: '1' },
    ]
  },
  {
    id: '2',
    name: 'Transporte',
    color: '#3B82F6',
    subcategories: [
      { id: '2-1', name: 'Combustível', categoryId: '2' },
      { id: '2-2', name: 'Mecânica', categoryId: '2' },
      { id: '2-3', name: 'Transporte Público', categoryId: '2' },
    ]
  }
];

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setCategories(parsed.categories || defaultCategories);
        setExpenses(parsed.expenses || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    }
  }, []);

  useEffect(() => {
    const dataToSave = { categories, expenses };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [categories, expenses]);

  const addCategory = (name: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      subcategories: []
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
    setExpenses(prev => prev.filter(exp => exp.categoryId !== id));
  };

  const addSubcategory = (name: string, categoryId: string) => {
    const newSubcategory: Subcategory = {
      id: `${categoryId}-${Date.now()}`,
      name,
      categoryId
    };
    
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, subcategories: [...cat.subcategories, newSubcategory] }
        : cat
    ));
  };

  const deleteSubcategory = (id: string) => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      subcategories: cat.subcategories.filter(sub => sub.id !== id)
    })));
    setExpenses(prev => prev.filter(exp => exp.subcategoryId !== id));
  };

  const addExpense = (amount: number, date: string, subcategoryId: string, categoryId: string) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      amount,
      date,
      subcategoryId,
      categoryId
    };
    setExpenses(prev => [...prev, newExpense]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  const updateExpense = (id: string, amount: number, date: string, subcategoryId: string, categoryId: string) => {
    setExpenses(prev => prev.map(exp =>
      exp.id === id ? { ...exp, amount, date, subcategoryId, categoryId } : exp
    ));
  };

  const exportData = () => {
    const dataToExport = { categories, expenses };
    return JSON.stringify(dataToExport, null, 2);
  };

  const importData = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.categories && parsed.expenses) {
        setCategories(parsed.categories);
        setExpenses(parsed.expenses);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  };

  const getSubcategory = (id: string) => {
    for (const category of categories) {
      const subcategory = category.subcategories.find(sub => sub.id === id);
      if (subcategory) return subcategory;
    }
    return undefined;
  };

  const getCategory = (id: string) => {
    return categories.find(cat => cat.id === id);
  };

  return (
    <ExpenseContext.Provider value={{
      categories,
      expenses,
      addCategory,
      deleteCategory,
      addSubcategory,
      deleteSubcategory,
      addExpense,
      deleteExpense,
      updateExpense,
      exportData,
      importData,
      getSubcategory,
      getCategory
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};
