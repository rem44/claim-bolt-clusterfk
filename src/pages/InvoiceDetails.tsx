import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Printer, FileDown } from 'lucide-react';
import { getInvoiceById } from '../services/invoiceService';
import { Invoice, InvoiceItem } from '../types/invoice';
import { Product } from '../types/product';

const InvoiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice & { 
    client: { name: string, code: string },
    items: (InvoiceItem & { product: Product })[]
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const data = await getInvoiceById(id);
        setInvoice(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError('Failed to load invoice details');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0C3B5E]"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error || 'Invoice not found'}</span>
        <button 
          onClick={() => navigate('/')}
          className="mt-3 bg-red-700 text-white px-4 py-2 rounded-md hover:bg-red-800 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const calculateTotals = () => {
    return invoice.items.reduce((totals, item) => {
      return {
        cost: totals.cost + item.total_cost,
        price: totals.price + item.total_price,
        profit: totals.profit + item.total_profit
      };
    }, { cost: 0, price: 0, profit: 0 });
  };

  const totals = calculateTotals();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <button 
            onClick={() => navigate('/')}
            className="mr-3 text-gray-500 hover:text-[#0C3B5E] transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold flex items-center">
              Invoice {invoice.invoice_number}
            </h1>
            <p className="text-gray-500">
              {invoice.client.name} • {format(new Date(invoice.invoice_date), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded hover:bg-gray-50 transition-colors flex items-center">
            <Printer size={16} className="mr-1" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded hover:bg-gray-50 transition-colors flex items-center">
            <FileDown size={16} className="mr-1" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Invoice Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Invoice Number</p>
                <p className="font-medium">{invoice.invoice_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{format(new Date(invoice.invoice_date), 'MMMM d, yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Currency</p>
                <p className="font-medium">{invoice.currency}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Client Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Client Name</p>
                <p className="font-medium">{invoice.client.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Client ID</p>
                <p className="font-medium">{invoice.client.code}</p>
              </div>
            </div>
          </div>
        </div>
        
        <h3 className="text-lg font-medium mb-4">Invoice Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shipping Code
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.product?.code || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.item_description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.shipping_code || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${item.unit_selling_price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${item.total_price.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={5} className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  Total
                </td>
                <td className="px-6 py-3 text-right text-sm font-bold text-gray-900">
                  ${totals.price.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;