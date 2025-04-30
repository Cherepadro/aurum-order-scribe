
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, employeeName, workshopAddress } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-jewelry-dark border-b border-border shadow-md">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-semibold text-jewelry-gold">Тонко</h1>
          <span className="hidden sm:inline-block text-sm text-jewelry-silver">
            {employeeName && workshopAddress ? `${employeeName} | ${workshopAddress}` : ''}
          </span>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-4">
          <Button
            variant="ghost"
            className={`${isActive('/order') ? 'text-jewelry-gold' : 'text-foreground'} hover:text-jewelry-gold`}
            onClick={() => navigate('/order')}
          >
            Заказы
          </Button>
          <Button
            variant="ghost"
            className={`${isActive('/orders-table') ? 'text-jewelry-gold' : 'text-foreground'} hover:text-jewelry-gold`}
            onClick={() => navigate('/orders-table')}
          >
            Таблица
          </Button>
          <Button
            variant="ghost"
            className={`${isActive('/reports') ? 'text-jewelry-gold' : 'text-foreground'} hover:text-jewelry-gold`}
            onClick={() => navigate('/reports')}
          >
            Отчёты
          </Button>
          <Button
            variant="ghost"
            className="text-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            Выход
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
