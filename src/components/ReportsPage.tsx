
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Package, Printer, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type LogEntry = {
  order_id: number;
  order_date: string;
  accepted_by: string;
  accepted_by_name: string;
  completed_by: string | null;
  completed_by_name: string | null;
  completion_date: string | null;
  issued_by: string | null;
  issued_by_name: string | null;
  issue_date: string | null;
};

const ReportsPage = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      
      try {
        // First get all order logs
        const { data: orderLogs, error: logsError } = await supabase
          .from('order_logs')
          .select('*');
          
        if (logsError) throw logsError;
        
        if (!orderLogs) {
          setLogs([]);
          setIsLoading(false);
          return;
        }
        
        // Fetch employee details for each log entry
        const logsWithNames = await Promise.all(
          orderLogs.map(async (log) => {
            // Get accepted_by employee name
            let acceptedByName = 'Неизвестно';
            if (log.accepted_by) {
              const { data: acceptedBy } = await supabase
                .from('employees')
                .select('name')
                .eq('id', log.accepted_by)
                .single();
              
              acceptedByName = acceptedBy?.name || 'Неизвестно';
            }
            
            // Get completed_by employee name
            let completedByName = null;
            if (log.completed_by) {
              const { data: completedBy } = await supabase
                .from('employees')
                .select('name')
                .eq('id', log.completed_by)
                .single();
              
              completedByName = completedBy?.name || null;
            }
            
            // Get issued_by employee name
            let issuedByName = null;
            if (log.issued_by) {
              const { data: issuedBy } = await supabase
                .from('employees')
                .select('name')
                .eq('id', log.issued_by)
                .single();
              
              issuedByName = issuedBy?.name || null;
            }
            
            return {
              order_id: log.order_id,
              order_date: log.order_date,
              accepted_by: log.accepted_by,
              accepted_by_name: acceptedByName,
              completed_by: log.completed_by,
              completed_by_name: completedByName,
              completion_date: log.completion_date,
              issued_by: log.issued_by,
              issued_by_name: issuedByName,
              issue_date: log.issue_date,
            };
          })
        );
        
        setLogs(logsWithNames);
      } catch (error) {
        console.error('Error fetching logs:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные отчетов",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();

    // Set up real-time subscription for logs
    const subscription = supabase
      .channel('table:order_logs')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'order_logs' }, 
        () => {
          fetchLogs();
        })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const handleExportExcel = () => {
    // Will implement Excel export
    toast({
      description: "Функция экспорта в Excel будет доступна в следующей версии"
    });
  };

  const handleExportPDF = () => {
    // Will implement PDF export
    toast({
      description: "Функция экспорта в PDF будет доступна в следующей версии"
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <Card className="jewelry-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold text-jewelry-gold">Отчёты</CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={handleExportExcel} 
              className="jewelry-btn-outline flex items-center gap-1"
            >
              <Save className="h-4 w-4" />
              Excel
            </Button>
            <Button 
              onClick={handleExportPDF} 
              className="jewelry-btn-outline flex items-center gap-1"
            >
              <Printer className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/5">
                  <TableHead className="text-jewelry-gold">Номер заказа</TableHead>
                  <TableHead className="text-jewelry-gold">Дата заказа</TableHead>
                  <TableHead className="text-jewelry-gold">Принял</TableHead>
                  <TableHead className="text-jewelry-gold">Выполнил</TableHead>
                  <TableHead className="text-jewelry-gold">Дата выполнения</TableHead>
                  <TableHead className="text-jewelry-gold">Выдал</TableHead>
                  <TableHead className="text-jewelry-gold">Дата выдачи</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-jewelry-silver">
                      Загрузка...
                    </TableCell>
                  </TableRow>
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <TableRow key={log.order_id} className="hover:bg-muted/10">
                      <TableCell className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-jewelry-gold" />
                        {log.order_id}
                      </TableCell>
                      <TableCell>{formatDate(log.order_date)}</TableCell>
                      <TableCell>{log.accepted_by_name}</TableCell>
                      <TableCell>{log.completed_by_name || '—'}</TableCell>
                      <TableCell>{formatDate(log.completion_date)}</TableCell>
                      <TableCell>{log.issued_by_name || '—'}</TableCell>
                      <TableCell>{formatDate(log.issue_date)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-jewelry-silver">
                      Записи не найдены
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

export default ReportsPage;
