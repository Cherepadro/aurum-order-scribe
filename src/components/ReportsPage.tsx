
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
  accepted_by: {
    name: string;
  };
  completed_by: {
    name: string;
  } | null;
  completion_date: string | null;
  issued_by: {
    name: string;
  } | null;
  issue_date: string | null;
};

const ReportsPage = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('order_logs')
        .select(`
          order_id,
          order_date,
          accepted_by:accepted_by(name),
          completed_by:completed_by(name),
          completion_date,
          issued_by:issued_by(name),
          issue_date
        `)
        .order('order_date', { ascending: false });

      if (error) {
        console.error('Error fetching logs:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные отчетов",
          variant: "destructive",
        });
      } else {
        setLogs(data || []);
      }
      
      setIsLoading(false);
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
                      <TableCell>{log.accepted_by?.name || '—'}</TableCell>
                      <TableCell>{log.completed_by?.name || '—'}</TableCell>
                      <TableCell>{formatDate(log.completion_date)}</TableCell>
                      <TableCell>{log.issued_by?.name || '—'}</TableCell>
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
