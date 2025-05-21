import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import { supabase } from '../lib/supabase';

interface ImportStatus {
  type: 'success' | 'error' | 'info';
  message: string;
}

const SettingsPage: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tables = [
    { value: 'clients', label: 'Clients' },
    { value: 'products', label: 'Products' },
    { value: 'claims', label: 'Claims' }
  ];

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedTable) {
      setImportStatus({
        type: 'error',
        message: 'Please select both a table and a CSV file'
      });
      return;
    }

    setImporting(true);
    setImportStatus({
      type: 'info',
      message: 'Processing CSV file...'
    });

    try {
      const text = await file.text();
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const { data, error } = await supabase
              .from(selectedTable)
              .insert(results.data);

            if (error) throw error;

            setImportStatus({
              type: 'success',
              message: `Successfully imported ${results.data.length} records to ${selectedTable}`
            });
          } catch (error) {
            console.error('Import error:', error);
            setImportStatus({
              type: 'error',
              message: `Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
          }
        },
        error: (error) => {
          setImportStatus({
            type: 'error',
            message: `Failed to parse CSV: ${error.message}`
          });
        }
      });
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getStatusIcon = () => {
    if (!importStatus) return null;

    switch (importStatus.type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">Import Data</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Table
            </label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-corporate-secondary focus:border-transparent"
            >
              <option value="">Select a table</option>
              {tables.map(table => (
                <option key={table.value} value={table.value}>
                  {table.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CSV File
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-corporate-secondary transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-corporate-secondary hover:text-corporate-accent focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-corporate-secondary"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".csv"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      disabled={importing || !selectedTable}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">CSV files only</p>
              </div>
            </div>
          </div>

          {importStatus && (
            <div className={`mt-4 p-4 rounded-md flex items-center space-x-2 ${
              importStatus.type === 'success' ? 'bg-green-50' :
              importStatus.type === 'error' ? 'bg-red-50' : 'bg-blue-50'
            }`}>
              {getStatusIcon()}
              <span className={
                importStatus.type === 'success' ? 'text-green-700' :
                importStatus.type === 'error' ? 'text-red-700' : 'text-blue-700'
              }>
                {importStatus.message}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;