
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { supabase } from "@/integrations/supabase/client";

type Employee = {
  id: string;
  name: string;
};

type Workshop = {
  id: string;
  address: string;
};

const AuthPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>('');
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { setAuth, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/order');
    }
  }, [isAuthenticated, navigate]);

  // Fetch employees and workshops from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Fetch workshops
      const { data: workshopsData, error: workshopsError } = await supabase
        .from('workshops')
        .select('id, address');

      if (workshopsError) {
        console.error('Error fetching workshops:', workshopsError);
      } else {
        setWorkshops(workshopsData || []);
      }

      // Fetch employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, name');

      if (employeesError) {
        console.error('Error fetching employees:', employeesError);
      } else {
        setEmployees(employeesData || []);
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleEmployeeChange = (value: string) => {
    const employee = employees.find(emp => emp.id === value);
    if (employee) {
      setSelectedEmployee(employee.name);
      setSelectedEmployeeId(employee.id);
    }
  };

  const handleWorkshopChange = (value: string) => {
    const workshop = workshops.find(ws => ws.id === value);
    if (workshop) {
      setSelectedWorkshop(workshop.address);
      setSelectedWorkshopId(workshop.id);
    }
  };

  const handleLogin = () => {
    if (selectedEmployee && selectedWorkshop) {
      setAuth(selectedEmployee, selectedWorkshop, selectedEmployeeId, selectedWorkshopId);
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
            <Select onValueChange={handleEmployeeChange}>
              <SelectTrigger className="jewelry-input w-full">
                <SelectValue placeholder="Выберите сотрудника" />
              </SelectTrigger>
              <SelectContent className="bg-jewelry-dark border-border text-foreground">
                {employees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id}>
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
            <Select onValueChange={handleWorkshopChange}>
              <SelectTrigger className="jewelry-input w-full">
                <SelectValue placeholder="Выберите адрес мастерской" />
              </SelectTrigger>
              <SelectContent className="bg-jewelry-dark border-border text-foreground">
                {workshops.map(workshop => (
                  <SelectItem key={workshop.id} value={workshop.id}>
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
            disabled={!selectedEmployee || !selectedWorkshop || isLoading}
          >
            {isLoading ? 'Загрузка...' : 'Войти'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthPage;
