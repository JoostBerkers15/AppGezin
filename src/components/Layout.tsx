import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  ShoppingCart, 
  UtensilsCrossed, 
  Bed, 
  CheckSquare, 
  Users, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import '../styles/Layout.css';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'calendar', label: 'Kalender', icon: Calendar },
    { id: 'shopping', label: 'Boodschappen', icon: ShoppingCart },
    { id: 'meals', label: 'Maaltijden', icon: UtensilsCrossed },
    { id: 'sleepovers', label: 'Logeren', icon: Bed },
    { id: 'tasks', label: 'Taken', icon: CheckSquare },
    { id: 'family', label: 'Gezin', icon: Users },
  ];

  const handlePageChange = (pageId: string) => {
    onPageChange(pageId);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <button
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="app-title">Gezin app</h1>
          </div>
          
          <div className="header-right">
            <span className="user-name">Welkom, {user?.username}</span>
            <button className="logout-button" onClick={handleLogout} aria-label="Uitloggen">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="main-container">
        <nav className={`sidebar ${isMobileMenuOpen ? 'sidebar-open' : ''}`}>
          <ul className="nav-menu">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.id}>
                  <button
                    className={`nav-item ${currentPage === item.id ? 'nav-item-active' : ''}`}
                    onClick={() => handlePageChange(item.id)}
                  >
                    <IconComponent size={20} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="content">
          {children}
        </main>
      </div>

      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
