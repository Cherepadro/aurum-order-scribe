
import React from 'react';
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

// Mock data (will be replaced with Supabase data later)
const mockOrders = [
  {
    id: 1,
    date: '10.05.2025',
    workshop: 'ул. Ленина, 10',
    client: 'Иванов И.И.',
    phone: '+7 (999) 123-45-67',
    priority: 'standard',
    status: 'new',
    price: '5000',
  },
  {
    id: 2,
    date: '11.05.2025',
    workshop: 'ул. Пушкина, 15',
    client: 'Петрова М.С.',
    phone: '+7 (999) 765-43-21',
    priority: 'urgent',
    status: 'in_progress',
    price: '8000',
  },
  {
    id: 3,
    date: '12.05.2025',
    workshop: 'пр. Мира, 25',
    client: 'Сидоров А.П.',
    phone: '+7 (999) 111-22-33',
    priority: 'non-urgent',
    status: 'completed',
    price: '3500',
  },
];

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
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('');
  const [selectedPriority, setSelectedPriority] = React.useState('');
  const [selectedOrder, setSelectedOrder] = React.useState<number | null>(null);

  const handleOrderClick = (orderId: number) => {
    setSelectedOrder(selectedOrder === orderId ? null : orderId);
  };

  const handleEdit = (orderId: number) => {
    // Navigate to edit page or open modal
    console.log('Edit order:', orderId);
  };

  const handleComplete = (orderId: number) => {
    // Mark as completed
    console.log('Complete order:', orderId);
  };

  const handleIssue = (orderId: number) => {
    // Mark as issued
    console.log('Issue order:', orderId);
  };

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) ||
      order.date.includes(searchTerm) ||
      order.workshop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm);
      
    const matchesStatus = !selectedStatus || order.status === selectedStatus;
    const matchesPriority = !selectedPriority || order.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

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
                  <SelectItem value="">Все статусы</SelectItem>
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
                  <SelectItem value="">Все приоритеты</SelectItem>
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
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <TableRow
                        className={`cursor-pointer border-l-2 hover:bg-muted/10 ${
                          getStatusColor(order.status, order.priority)
                        } ${selectedOrder === order.id ? 'bg-muted/20' : ''}`}
                        onClick={() => handleOrderClick(order.id)}
                      >
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>{order.workshop}</TableCell>
                        <TableCell>{order.client}</TableCell>
                        <TableCell>{order.phone}</TableCell>
                        <TableCell>{getPriorityText(order.priority)}</TableCell>
                        <TableCell>{getStatusText(order.status)}</TableCell>
                        <TableCell className="text-right">{`${order.price} ₽`}</TableCell>
                      </TableRow>
                      {selectedOrder === order.id && (
                        <TableRow className="bg-muted/10 border-0">
                          <TableCell colSpan={8} className="p-2">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleEdit(order.id)}
                                className="jewelry-btn-outline flex items-center gap-1"
                              >
                                <Edit className="h-4 w-4" />
                                Ред.
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleComplete(order.id)}
                                className="jewelry-btn-outline flex items-center gap-1"
                                disabled={order.status === 'completed' || order.status === 'issued'}
                              >
                                <Check className="h-4 w-4" />
                                Готово
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleIssue(order.id)}
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
