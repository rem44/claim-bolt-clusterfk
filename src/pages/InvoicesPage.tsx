import React, { useState, useEffect } from 'react';
import { useInvoices } from '../context/InvoicesContext';
import { format } from 'date-fns';
import { Search, Filter, ArrowUpDown, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const InvoicesPage: React.FC = () => {
  const { invoices, loading, error, refreshInvoices } = useInvoices();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('invoice_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({
    client: '',
    currency: '',
  });

  useEffect(() => {
    refreshInvoices();
  }, []);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    return (
      (searchQuery === '' || 
        invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.client?.name?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filters.client === '' || invoice.client?.name === filters.client) &&
      (filters.currency === '' || invoice.currency === filters.currency)
    );
  });

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'invoice_number':
        comparison = a.invoice_number.localeCompare(b.invoice_number);
        break;
      case 'invoice_date':
        comparison = new Date(a.invoice_date).getTime() - new Date(b.invoice_date).getTime();
        break;
      case 'client':
        comparison = (a.client?.name || '').localeCompare(b.client?.name || '');
        break;
      case 'total_amount':
        comparison = a.total_amount - b.total_amount;
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const uniqueClients = Array.from(new Set(invoices.map(invoice => invoice.client?.name).filter(Boolean)));
  const uniqueCurrencies = Array.from(new Set(invoices.map(invoice => invoice.currency)));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0C3B5E]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Invoices</h1>
      
      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search invoices..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filters.client}
                onChange={(e) => setFilters({...filters, client: e.target.value})}
              >
                <option value="">All Clients</option>
                {uniqueClients.map((client, index) => (
                  <option key={index} value={client}>{client}</option>
                ))}
              </select>
            </div>
            <div>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filters.currency}
                onChange={(e) => setFilters({...filters, currency: e.target.value})}
              >
                <option value="">All Currencies</option>
                {uniqueCurrencies.map((currency, index) => (
                  <option key={index} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader
                  title="Invoice #"
                  field="invoice_number"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  title="Date"
                  field="invoice_date"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  title="Client"
                  field="client"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Currency
                </th>
                <SortableHeader
                  title="Total Amount"
                  field="total_amount"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                  className="text-right"
                />
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedInvoices.map((invoice, index) => (
                <tr 
                  key={invoice.id} 
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-150`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.invoice_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(invoice.invoice_date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.client?.name || 'Unknown Client'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${invoice.total_amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      to={`/invoices/${invoice.id}`}
                      className="text-[#0C3B5E] hover:text-blue-900 transition-colors duration-200"
                    >
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface SortableHeaderProps {
  title: string;
  field: string;
  currentSort: string;
  direction: 'asc' | 'desc';
  onSort: (field: string) => void;
  className?: string;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ 
  title, 
  field, 
  currentSort, 
  direction, 
  onSort,
  className = "text-left" 
}) => {
  return (
    <th 
      className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{title}</span>
        <ArrowUpDown 
          size={14} 
          className={`${currentSort === field ? 'text-[#0C3B5E]' : 'text-gray-400'}`} 
        />
      </div>
    </th>
  );
};

export default InvoicesPage;