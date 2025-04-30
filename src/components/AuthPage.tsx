
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type Employee = {
  id: number;
  name: string;
};

type Workshop = {
  id: number;
  address: string;
};

// Mock data (will be replaced with Supabase data later)
const mockEmployees: Employee[] = [
  { id: 1, name: 'Иван Петров' },
  { id: 2, name: 'Мария Смирнова' },
  { id: 3, name: 'Алексей Иванов' }
];

const mockWorkshops: Workshop[] = [
  { id: 1, address: 'ул. Ленина, 10' },
  { id: 2, address: 'ул. Пушкина, 15' },
  { id: 3, address: 'пр. Мира, 25' }
];

const AuthPage = () => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [workshops, setWorkshops] = useState<Workshop[]>(mockWorkshops);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>('');
  const { setAuth, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/order');
    }
  }, [isAuthenticated, navigate]);

  // Later this will be connected to Supabase
  // const fetchEmployeesAndWorkshops = async () => {
  //   // Fetch from Supabase
  // };

  const handleLogin = () => {
    if (selectedEmployee && selectedWorkshop) {
      setAuth(selectedEmployee, selectedWorkshop);
      navigate('/order');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <Card className="jewelry-card w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-semibold text-jewelry-gold">Тонко</CardTitle>
          <p className="text-jewelry-silver mt-2">Ювелирная мастерская</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="employee" className="block text-sm font-medium">
              Сотрудник
            </label>
            <Select onValueChange={setSelectedEmployee} value={selectedEmployee}>
              <SelectTrigger className="jewelry-input w-full">
                <SelectValue placeholder="Выберите сотрудника" />
              </SelectTrigger>
              <SelectContent className="bg-jewelry-dark border-border text-foreground">
                {employees.map(employee => (
                  <SelectItem key={employee.id} value={employee.name}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="workshop" className="block text-sm font-medium">
              Мастерская
            </label>
            <Select onValueChange={setSelectedWorkshop} value={selectedWorkshop}>
              <SelectTrigger className="jewelry-input w-full">
                <SelectValue placeholder="Выберите адрес мастерской" />
              </SelectTrigger>
              <SelectContent className="bg-jewelry-dark border-border text-foreground">
                {workshops.map(workshop => (
                  <SelectItem key={workshop.id} value={workshop.address}>
                    {workshop.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className={`w-full ${
              selectedEmployee && selectedWorkshop 
                ? 'jewelry-btn' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
            onClick={handleLogin}
            disabled={!selectedEmployee || !selectedWorkshop}
          >
            Войти
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthPage;
