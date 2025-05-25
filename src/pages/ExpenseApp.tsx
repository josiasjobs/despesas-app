
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../components/HomePage';
import NewExpensePage from '../components/NewExpensePage';
import CategoriesPage from '../components/CategoriesPage';
import ReportPage from '../components/ReportPage';
import HistoryPage from '../components/HistoryPage';
import ShoppingListPage from '../components/ShoppingListPage';
import { ExpenseProvider } from '../contexts/ExpenseContext';

const ExpenseApp = () => {
  return (
    <ExpenseProvider>
      <div className="min-h-screen bg-gray-50">
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/nova-despesa" element={<NewExpensePage />} />
            <Route path="/lista-compras" element={<ShoppingListPage />} />
            <Route path="/categorias" element={<CategoriesPage />} />
            <Route path="/relatorio" element={<ReportPage />} />
            <Route path="/historico" element={<HistoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </div>
    </ExpenseProvider>
  );
};

export default ExpenseApp;
