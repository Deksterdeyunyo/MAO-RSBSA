import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Download, Printer } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('inventory');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReportData = async () => {
    setLoading(true);
    if (reportType === 'inventory') {
      const { data: invData } = await supabase.from('inventory').select('*').order('type').order('name');
      setData(invData || []);
    } else if (reportType === 'distribution') {
      const { data: distData } = await supabase
        .from('distributions')
        .select(`
          *,
          recipients (first_name, last_name, rsbsa_number, barangay),
          inventory (name, type, unit)
        `)
        .order('date_distributed', { ascending: false });
      setData(distData || []);
    } else if (reportType === 'recipients') {
      const { data: recData } = await supabase.from('recipients').select('*').order('last_name');
      setData(recData || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  const handlePrint = () => {
    window.print();
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`MAO RSBSA - ${reportType.toUpperCase()} REPORT`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${format(new Date(), 'PPpp')}`, 14, 22);

    let head = [[]] as any;
    let body = [] as any;

    if (reportType === 'inventory') {
      head = [['Type', 'Name', 'Description', 'Quantity', 'Unit']];
      body = data.map(item => [
        item.type.replace('_', ' ').toUpperCase(),
        item.name,
        item.description || '',
        item.quantity,
        item.unit
      ]);
    } else if (reportType === 'distribution') {
      head = [['Date', 'Recipient', 'RSBSA No.', 'Barangay', 'Item', 'Quantity']];
      body = data.map(item => [
        format(new Date(item.date_distributed), 'MMM dd, yyyy'),
        `${item.recipients?.last_name}, ${item.recipients?.first_name}`,
        item.recipients?.rsbsa_number,
        item.recipients?.barangay,
        item.inventory?.name,
        `${item.quantity} ${item.inventory?.unit}`
      ]);
    } else if (reportType === 'recipients') {
      head = [['RSBSA No.', 'Last Name', 'First Name', 'Barangay', 'Contact']];
      body = data.map(item => [
        item.rsbsa_number,
        item.last_name,
        item.first_name,
        item.barangay,
        item.contact_number || ''
      ]);
    }

    (doc as any).autoTable({
      startY: 30,
      head: head,
      body: body,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 163, 74] } // green-600
    });

    doc.save(`mao-rsbsa-${reportType}-report.pdf`);
  };

  const exportExcel = () => {
    let wsData = [];
    
    if (reportType === 'inventory') {
      wsData = data.map(item => ({
        Type: item.type.replace('_', ' ').toUpperCase(),
        Name: item.name,
        Description: item.description || '',
        Quantity: item.quantity,
        Unit: item.unit
      }));
    } else if (reportType === 'distribution') {
      wsData = data.map(item => ({
        Date: format(new Date(item.date_distributed), 'MMM dd, yyyy'),
        'Recipient Name': `${item.recipients?.last_name}, ${item.recipients?.first_name}`,
        'RSBSA No.': item.recipients?.rsbsa_number,
        Barangay: item.recipients?.barangay,
        Item: item.inventory?.name,
        'Item Type': item.inventory?.type,
        Quantity: item.quantity,
        Unit: item.inventory?.unit,
        Remarks: item.remarks || ''
      }));
    } else if (reportType === 'recipients') {
      wsData = data.map(item => ({
        'RSBSA No.': item.rsbsa_number,
        'Last Name': item.last_name,
        'First Name': item.first_name,
        Barangay: item.barangay,
        Contact: item.contact_number || ''
      }));
    }

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `mao-rsbsa-${reportType}-report.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
            <Printer className="w-5 h-5" />
            Print
          </button>
          <button onClick={exportPDF} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
            <FileText className="w-5 h-5" />
            Export PDF
          </button>
          <button onClick={exportExcel} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
            <Download className="w-5 h-5" />
            Export Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-none">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 print:hidden">
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Report Type:</span>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="inventory">Current Inventory</option>
                <option value="distribution">Distribution History</option>
                <option value="recipients">Registered Recipients</option>
              </select>
            </label>
          </div>
        </div>

        <div className="p-6 hidden print:block">
          <h2 className="text-2xl font-bold text-center mb-2">MAO RSBSA</h2>
          <h3 className="text-xl font-semibold text-center mb-6 uppercase">{reportType} REPORT</h3>
          <p className="text-sm text-gray-500 mb-4">Generated on: {format(new Date(), 'PPpp')}</p>
        </div>

        <div className="overflow-x-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading report data...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200 print:bg-gray-100">
                  {reportType === 'inventory' && (
                    <>
                      <th className="px-6 py-3 font-medium">Type</th>
                      <th className="px-6 py-3 font-medium">Name</th>
                      <th className="px-6 py-3 font-medium">Quantity</th>
                      <th className="px-6 py-3 font-medium">Unit</th>
                    </>
                  )}
                  {reportType === 'distribution' && (
                    <>
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium">Recipient</th>
                      <th className="px-6 py-3 font-medium">Barangay</th>
                      <th className="px-6 py-3 font-medium">Item</th>
                      <th className="px-6 py-3 font-medium">Qty</th>
                    </>
                  )}
                  {reportType === 'recipients' && (
                    <>
                      <th className="px-6 py-3 font-medium">RSBSA No.</th>
                      <th className="px-6 py-3 font-medium">Name</th>
                      <th className="px-6 py-3 font-medium">Barangay</th>
                      <th className="px-6 py-3 font-medium">Contact</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No data available for this report.</td>
                  </tr>
                ) : (
                  data.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-gray-50/50 transition-colors">
                      {reportType === 'inventory' && (
                        <>
                          <td className="px-6 py-3 text-gray-500 capitalize">{item.type.replace('_', ' ')}</td>
                          <td className="px-6 py-3 font-medium text-gray-900">{item.name}</td>
                          <td className="px-6 py-3 font-medium">{item.quantity}</td>
                          <td className="px-6 py-3 text-gray-500">{item.unit}</td>
                        </>
                      )}
                      {reportType === 'distribution' && (
                        <>
                          <td className="px-6 py-3 text-gray-900 whitespace-nowrap">{format(new Date(item.date_distributed), 'MMM dd, yyyy')}</td>
                          <td className="px-6 py-3 font-medium text-gray-900">{item.recipients?.last_name}, {item.recipients?.first_name}</td>
                          <td className="px-6 py-3 text-gray-500">{item.recipients?.barangay}</td>
                          <td className="px-6 py-3 text-gray-900">{item.inventory?.name}</td>
                          <td className="px-6 py-3 font-medium">{item.quantity} {item.inventory?.unit}</td>
                        </>
                      )}
                      {reportType === 'recipients' && (
                        <>
                          <td className="px-6 py-3 font-medium text-gray-900">{item.rsbsa_number}</td>
                          <td className="px-6 py-3 text-gray-900">{item.last_name}, {item.first_name}</td>
                          <td className="px-6 py-3 text-gray-500">{item.barangay}</td>
                          <td className="px-6 py-3 text-gray-500">{item.contact_number || '-'}</td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
