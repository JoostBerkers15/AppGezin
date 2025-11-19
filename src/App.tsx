import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import FamilyPage from './pages/FamilyPage';
import CalendarPage from './pages/CalendarPage';
import ShoppingPage from './pages/ShoppingPage';
import MealsPage from './pages/MealsPage';
import SleepoverPage from './pages/SleepoverPage';
import TasksPage from './pages/TasksPage';
import './App.css';

function App() {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('calendar');

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Laden...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'family':
        return <FamilyPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'shopping':
        return <ShoppingPage />;
      case 'meals':
        return <MealsPage />;
      case 'sleepovers':
        return <SleepoverPage />;
      case 'tasks':
        return <TasksPage />;
      default:
        return <CalendarPage />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  );
}

export default App;
