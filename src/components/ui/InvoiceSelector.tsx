import React, { useState, useEffect, useRef } from 'react';
import { useInvoices } from '../../context/InvoicesContext';
import { Search, X } from 'lucide-react';
import { Invoice } from '../../types/invoice';

interface InvoiceSelectorProps {
  onInvoiceSelect: (invoiceNumber: string) => void;
  selectedInvoice?: string;
}

const InvoiceSelector: React.FC<InvoiceSelectorProps> = ({ onInvoiceSelect, selectedInvoice }) => {
  const { invoices, loading, error } = useInvoices();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState<Invoice | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedInvoice) {
      const invoice = invoices.find(i => i.invoice_number === selectedInvoice);
      if (invoice) {
        setSelectedInvoiceData(invoice);
      }
    }
  }, [selectedInvoice, invoices]);

  const filteredInvoices = searchQuery
    ? invoices.filter(invoice =>
        invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.client?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : invoices;

  console.log('InvoiceSelector state:', {
    totalInvoices: invoices.length,
    filteredCount: filteredInvoices.length,
    searchQuery,
    selectedInvoice
  });

  const handleInvoiceSelect = (invoice: Invoice) => {
    console.log('Selected invoice:', invoice);
    setSelectedInvoiceData(invoice);
    onInvoiceSelect(invoice.invoice_number);
    setIsDropdownOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
  };

  const handleClearSelection = () => {
    setSelectedInvoiceData(null);
    setSearchQuery('');
    onInvoiceSelect('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Input value changed:', value);
    setSearchQuery(value);
    setIsDropdownOpen(true);
    setHighlightedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredInvoices.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredInvoices.length) {
          handleInvoiceSelect(filteredInvoices[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Invoice Reference
      </label>
      <div className="relative">
        <input 
          ref={inputRef}
          type="text"
          value={selectedInvoiceData ? selectedInvoiceData.invoice_number : searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className={`w-full p-2 pl-9 pr-8 border ${
            error ? 'border-red-500 bg-red-50' : 'border-gray-300'
          } rounded-md focus:outline-none focus:ring-2 focus:ring-corporate-secondary focus:border-transparent transition-all duration-200`}
          placeholder="Search invoices..."
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        {selectedInvoiceData && (
          <button
            onClick={handleClearSelection}
            className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {selectedInvoiceData && (
        <div className="mt-1.5 px-2 py-1 bg-corporate-light rounded-md text-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-corporate-dark font-medium">Client:</span>
              <span className="ml-1 text-corporate-secondary">{selectedInvoiceData.client?.name}</span>
            </div>
            <div>
              <span className="text-corporate-dark font-medium">Total:</span>
              <span className="ml-1 text-corporate-secondary">
                ${selectedInvoiceData.total_amount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {isDropdownOpen && filteredInvoices.length > 0 && !selectedInvoiceData && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
          <ul className="py-1">
            {filteredInvoices.map((invoice, index) => (
              <li
                key={invoice.id}
                className={`px-3 py-2 cursor-pointer transition-colors ${
                  index === highlightedIndex 
                    ? 'bg-corporate-light text-corporate-dark' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleInvoiceSelect(invoice)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="font-medium">{invoice.invoice_number}</div>
                <div className="text-sm text-gray-500 flex items-center justify-between">
                  <span>{invoice.client?.name}</span>
                  <span>${invoice.total_amount.toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(invoice.invoice_date).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isDropdownOpen && filteredInvoices.length === 0 && searchQuery && !selectedInvoiceData && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 p-3">
          <p className="text-sm text-gray-500 text-center">No invoices found</p>
        </div>
      )}
      
      {loading && (
        <div className="mt-1.5 text-sm text-gray-500 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-corporate-secondary border-t-transparent mr-2"></div>
          Loading invoices...
        </div>
      )}
      
      {error && (
        <div className="mt-1.5 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Debug information */}
      <div className="mt-1 text-xs text-gray-400">
        Total invoices: {invoices.length}, Filtered: {filteredInvoices.length}
      </div>
    </div>
  );
};

export default InvoiceSelector;