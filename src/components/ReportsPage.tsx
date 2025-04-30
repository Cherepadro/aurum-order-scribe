
import React from 'react';
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

// Mock data (will be replaced with Supabase data later)
const mockLogs = [
  {
    orderId: 1,
    orderDate: '10.05.2025',
    acceptedBy: 'Иван Петров',
    completedBy: 'Мария Смирнова',
    completionDate: '15.05.2025',
    issuedBy: 'Иван Петров',
    issueDate: '16.05.2025',
  },
  {
    orderId: 2,
    orderDate: '11.05.2025',
    acceptedBy: 'Мария Смирнова',
    completedBy: 'Алексей Иванов',
    completionDate: '17.05.2025',
    issuedBy: null,
    issueDate: null,
  },
  {
    orderId: 3,
    orderDate: '12.05.2025',
    acceptedBy: 'Алексей Иванов',
    completedBy: null,
    completionDate: null,
    issuedBy: null,
    issueDate: null,
  },
];

const ReportsPage = () => {
  const handleExportExcel = () => {
    // Will implement Excel export
    console.log('Exporting to Excel');
  };

  const handleExportPDF = () => {
    // Will implement PDF export
    console.log('Exporting to PDF');
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
                {mockLogs.map((log) => (
                  <TableRow key={log.orderId} className="hover:bg-muted/10">
                    <TableCell className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-jewelry-gold" />
                      {log.orderId}
                    </TableCell>
                    <TableCell>{log.orderDate}</TableCell>
                    <TableCell>{log.acceptedBy}</TableCell>
                    <TableCell>{log.completedBy || '—'}</TableCell>
                    <TableCell>{log.completionDate || '—'}</TableCell>
                    <TableCell>{log.issuedBy || '—'}</TableCell>
                    <TableCell>{log.issueDate || '—'}</TableCell>
                  </TableRow>
                ))}
                {mockLogs.length === 0 && (
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
