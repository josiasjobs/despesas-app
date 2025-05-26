
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

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

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  value: number;
}

interface ShoppingList {
  id: string;
  title: string;
  items: ShoppingItem[];
  createdAt: string;
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
  getSubcategory: (id: string) => Subcategory | undefined;
  getCategory: (id: string) => Category | undefined;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const generateRandomColor = () => {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Carregar dados do localStorage ao inicializar
  useEffect(() => {
    const savedCategories = localStorage.getItem('expense-categories');
    const savedExpenses = localStorage.getItem('expense-expenses');

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      // Categorias padrão
      const defaultCategories: Category[] = [
        {
          id: uuidv4(),
          name: 'Alimentação',
          color: '#EF4444',
          subcategories: [
            { id: uuidv4(), name: 'Restaurante', categoryId: '' },
            { id: uuidv4(), name: 'Supermercado', categoryId: '' }
          ]
        },
        {
          id: uuidv4(),
          name: 'Transporte',
          color: '#3B82F6',
          subcategories: [
            { id: uuidv4(), name: 'Combustível', categoryId: '' },
            { id: uuidv4(), name: 'Uber/Taxi', categoryId: '' }
          ]
        }
      ];

      // Corrigir categoryId das subcategorias
      defaultCategories.forEach(category => {
        category.subcategories.forEach(sub => {
          sub.categoryId = category.id;
        });
      });

      setCategories(defaultCategories);
    }

    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  // Salvar no localStorage sempre que houver mudança
  useEffect(() => {
    localStorage.setItem('expense-categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('expense-expenses', JSON.stringify(expenses));
  }, [expenses]);

  const addCategory = (name: string) => {
    const newCategory: Category = {
      id: uuidv4(),
      name,
      color: generateRandomColor(),
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
      id: uuidv4(),
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
      id: uuidv4(),
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
      exp.id === id 
        ? { ...exp, amount, date, subcategoryId, categoryId }
        : exp
    ));
  };

  const getSubcategory = (id: string): Subcategory | undefined => {
    for (const category of categories) {
      const subcategory = category.subcategories.find(sub => sub.id === id);
      if (subcategory) return subcategory;
    }
    return undefined;
  };

  const getCategory = (id: string): Category | undefined => {
    return categories.find(cat => cat.id === id);
  };

  const exportData = (): string => {
    // Incluir listas de compras na exportação
    const savedLists = localStorage.getItem('shopping-lists');
    const shoppingLists = savedLists ? JSON.parse(savedLists) : [];
    
    return JSON.stringify({ 
      categories, 
      expenses, 
      shoppingLists 
    }, null, 2);
  };

  const importData = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.categories && data.expenses) {
        setCategories(data.categories);
        setExpenses(data.expenses);
        
        // Importar listas de compras se existirem
        if (data.shoppingLists) {
          localStorage.setItem('shopping-lists', JSON.stringify(data.shoppingLists));
        }
        
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const value: ExpenseContextType = {
    categories,
    expenses,
    addCategory,
    deleteCategory,
    addSubcategory,
    deleteSubcategory,
    addExpense,
    deleteExpense,
    updateExpense,
    getSubcategory,
    getCategory,
    exportData,
    importData
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};
