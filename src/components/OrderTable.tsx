
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Check, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

type OrderType = {
  id: number;
  date: string;
  workshop: {
    address: string;
    id: string;
  } | null;
  employee: {
    name: string;
    id: string;
  } | null;
  client_name: string;
  client_phone: string;
  priority: string;
  status: string;
  price: string;
};

const getStatusColor = (status: string, priority: string) => {
  if (status === 'new') {
    return priority === 'urgent' ? 'bg-red-900/20 border-red-500/50' : 'bg-blue-900/20 border-blue-500/50';
  }
  if (status === 'in_progress') {
    return 'bg-orange-900/20 border-orange-500/50';
  }
  if (status === 'completed') {
    return 'bg-green-900/20 border-green-500/50';
  }
  if (status === 'issued') {
    return 'bg-purple-900/20 border-purple-500/50';
  }
  return '';
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'new': return 'Новый';
    case 'in_progress': return 'В работе';
    case 'completed': return 'Готов';
    case 'issued': return 'Выдан';
    default: return status;
  }
};

const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'standard': return 'Стандартный';
    case 'urgent': return 'Срочный';
    case 'non-urgent': return 'Не срочный';
    default: return priority;
  }
};

const OrderTable = () => {
  const { employeeId } = useAuth();
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    
    try {
      // First fetch all orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          date,
          workshop_id,
          employee_id,
          client_name,
          client_phone,
          priority,
          status,
          price
        `);
      
      if (ordersError) throw ordersError;
      
      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setIsLoading(false);
        return;
      }
      
      // Now fetch workshop and employee data separately and join them
      const enhancedOrders = await Promise.all(ordersData.map(async (order) => {
        // Fetch workshop data
        let workshop = null;
        if (order.workshop_id) {
          const { data: workshopData } = await supabase
            .from('workshops')
            .select('id, address')
            .eq('id', order.workshop_id)
            .single();
          
          if (workshopData) {
            workshop = {
              id: workshopData.id,
              address: workshopData.address
            };
          }
        }
        
        // Fetch employee data
        let employee = null;
        if (order.employee_id) {
          const { data: employeeData } = await supabase
            .from('employees')
            .select('id, name')
            .eq('id', order.employee_id)
            .single();
          
          if (employeeData) {
            employee = {
              id: employeeData.id,
              name: employeeData.name
            };
          }
        }
        
        return {
          id: order.id,
          date: order.date,
          workshop,
          employee,
          client_name: order.client_name,
          client_phone: order.client_phone || '',
          priority: order.priority || 'standard',
          status: order.status || 'new',
          price: order.price || ''
        };
      }));
      
      setOrders(enhancedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список заказов",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Set up real-time subscription for orders
    const subscription = supabase
      .channel('table:orders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        () => {
          fetchOrders();
        })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleOrderClick = (orderId: number) => {
    setSelectedOrder(selectedOrder === orderId ? null : orderId);
  };

  const handleComplete = async (orderId: number) => {
    try {
      // Update the order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Update the log entry with completion info
      const now = new Date().toISOString();
      const { error: logError } = await supabase
        .from('order_logs')
        .update({
          completed_by: employeeId,
          completion_date: now
        })
        .eq('order_id', orderId);

      if (logError) throw logError;

      toast({
        title: "Готово",
        description: `Заказ #${orderId} отмечен как выполненный`,
      });

      // Refresh the orders list
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус заказа",
        variant: "destructive",
      });
    }
  };

  const handleIssue = async (orderId: number) => {
    try {
      // Update the order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'issued' })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Update the log entry with issuance info
      const now = new Date().toISOString();
      const { error: logError } = await supabase
        .from('order_logs')
        .update({
          issued_by: employeeId,
          issue_date: now
        })
        .eq('order_id', orderId);

      if (logError) throw logError;

      toast({
        title: "Выдано",
        description: `Заказ #${orderId} отмечен как выданный клиенту`,
      });

      // Refresh the orders list
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус заказа",
        variant: "destructive",
      });
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) ||
      (order.date && order.date.includes(searchTerm)) ||
      (order.workshop?.address && order.workshop.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.client_name && order.client_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.client_phone && order.client_phone.includes(searchTerm));
      
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || order.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <Card className="jewelry-card mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-jewelry-gold">Таблица заказов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Поиск по номеру, дате, клиенту или телефону..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="jewelry-input"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="jewelry-input w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Статус" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-jewelry-dark border-border">
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="new">Новый</SelectItem>
                  <SelectItem value="in_progress">В работе</SelectItem>
                  <SelectItem value="completed">Готов</SelectItem>
                  <SelectItem value="issued">Выдан</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="jewelry-input w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Приоритет" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-jewelry-dark border-border">
                  <SelectItem value="all">Все приоритеты</SelectItem>
                  <SelectItem value="standard">Стандартный</SelectItem>
                  <SelectItem value="urgent">Срочный</SelectItem>
                  <SelectItem value="non-urgent">Не срочный</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/5">
                  <TableHead className="w-[80px] text-jewelry-gold">№</TableHead>
                  <TableHead className="text-jewelry-gold">Дата</TableHead>
                  <TableHead className="text-jewelry-gold">Мастерская</TableHead>
                  <TableHead className="text-jewelry-gold">Клиент</TableHead>
                  <TableHead className="text-jewelry-gold">Телефон</TableHead>
                  <TableHead className="text-jewelry-gold">Приоритет</TableHead>
                  <TableHead className="text-jewelry-gold">Статус</TableHead>
                  <TableHead className="text-jewelry-gold text-right">Цена</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-jewelry-silver">
                      Загрузка...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <TableRow
                        className={`cursor-pointer border-l-2 hover:bg-muted/10 ${
                          getStatusColor(order.status, order.priority)
                        } ${selectedOrder === order.id ? 'bg-muted/20' : ''}`}
                        onClick={() => handleOrderClick(order.id)}
                      >
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{formatDate(order.date)}</TableCell>
                        <TableCell>{order.workshop?.address || ''}</TableCell>
                        <TableCell>{order.client_name}</TableCell>
                        <TableCell>{order.client_phone}</TableCell>
                        <TableCell>{getPriorityText(order.priority)}</TableCell>
                        <TableCell>{getStatusText(order.status)}</TableCell>
                        <TableCell className="text-right">{order.price ? `${order.price} ₽` : ''}</TableCell>
                      </TableRow>
                      {selectedOrder === order.id && (
                        <TableRow className="bg-muted/10 border-0">
                          <TableCell colSpan={8} className="p-2">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Will implement edit functionality later
                                  toast({
                                    description: "Функция редактирования будет доступна в следующей версии"
                                  });
                                }}
                                className="jewelry-btn-outline flex items-center gap-1"
                              >
                                <Edit className="h-4 w-4" />
                                Ред.
                              </Button>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleComplete(order.id);
                                }}
                                className="jewelry-btn-outline flex items-center gap-1"
                                disabled={order.status === 'completed' || order.status === 'issued'}
                              >
                                <Check className="h-4 w-4" />
                                Готово
                              </Button>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleIssue(order.id);
                                }}
                                className="jewelry-btn flex items-center gap-1"
                                disabled={order.status !== 'completed'}
                              >
                                <Check className="h-4 w-4" />
                                Выдано
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-jewelry-silver">
                      Заказы не найдены
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderTable;
