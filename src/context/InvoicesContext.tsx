import React, { createContext, useContext, useState, useEffect } from 'react';
import { Invoice, InvoiceItem } from '../types/invoice';
import { getInvoices, getInvoiceByNumber } from '../services/invoiceService';

interface InvoicesContextType {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  getInvoiceByInvoiceNumber: (invoiceNumber: string) => Promise<Invoice | null>;
  refreshInvoices: () => Promise<void>;
}

const InvoicesContext = createContext<InvoicesContextType | undefined>(undefined);

export const InvoicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await getInvoices();
      console.log('Invoices fetched:', data.length, 'records');
      console.log('Invoice data sample:', data.slice(0, 2));
      setInvoices(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const getInvoiceByInvoiceNumber = async (invoiceNumber: string) => {
    try {
      return await getInvoiceByNumber(invoiceNumber);
    } catch (err) {
      console.error('Error fetching invoice:', err);
      return null;
    }
  };

  return (
    <InvoicesContext.Provider value={{ 
      invoices, 
      loading,
      error,
      getInvoiceByInvoiceNumber,
      refreshInvoices: fetchInvoices
    }}>
      {children}
    </InvoicesContext.Provider>
  );
};

export const useInvoices = () => {
  const context = useContext(InvoicesContext);
  if (context === undefined) {
    throw new Error('useInvoices must be used within an InvoicesProvider');
  }
  return context;
};