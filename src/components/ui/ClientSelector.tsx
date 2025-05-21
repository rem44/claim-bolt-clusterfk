import React, { useState, useEffect, useRef } from 'react';
import { Search, User, X } from 'lucide-react';
import { Client } from '../../types/client';
import { useClients } from '../../context/ClientsContext';

interface ClientSelectorProps {
  onClientSelect: (client: Client) => void;
  selectedClientId?: string;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({ onClientSelect, selectedClientId }) => {
  const { clients, loading, error } = useClients();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedClientId) {
      const client = clients.find(c => c.id === selectedClientId);
      if (client) {
        setSelectedClient(client);
      }
    }
  }, [selectedClientId, clients]);

  const filteredClients = searchQuery
    ? clients.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : clients;

  console.log('ClientSelector state:', {
    totalClients: clients.length,
    filteredCount: filteredClients.length,
    searchQuery,
    selectedClientId
  });

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    onClientSelect(client);
    setIsDropdownOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
  };

  const handleClearSelection = () => {
    setSelectedClient(null);
    setSearchQuery('');
    onClientSelect({ id: '', name: '', code: '' });
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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
          prev < filteredClients.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredClients.length) {
          handleClientSelect(filteredClients[highlightedIndex]);
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
        Client Name <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input 
          ref={inputRef}
          type="text"
          value={selectedClient ? selectedClient.name : searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className={`w-full p-2 pl-9 pr-8 border ${
            error ? 'border-red-500 bg-red-50' : 'border-gray-300'
          } rounded-md focus:outline-none focus:ring-2 focus:ring-corporate-secondary focus:border-transparent transition-all duration-200`}
          placeholder="Search clients..."
        />
        <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
        {selectedClient && (
          <button
            onClick={handleClearSelection}
            className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Debug information */}
      <div className="text-xs text-gray-500 mt-1">
        Available clients: {clients.length}, Filtered: {filteredClients.length}
      </div>

      {selectedClient && (
        <div className="mt-1.5 px-2 py-1 bg-corporate-light rounded-md text-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-corporate-dark font-medium">Code:</span>
              <span className="ml-1 text-corporate-secondary">{selectedClient.code}</span>
            </div>
            {selectedClient.email && (
              <div>
                <span className="text-corporate-dark font-medium">Email:</span>
                <span className="ml-1 text-corporate-secondary">{selectedClient.email}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {isDropdownOpen && filteredClients.length > 0 && !selectedClient && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
          <ul className="py-1">
            {filteredClients.map((client, index) => (
              <li
                key={client.id}
                className={`px-3 py-2 cursor-pointer transition-colors ${
                  index === highlightedIndex 
                    ? 'bg-corporate-light text-corporate-dark' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleClientSelect(client)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="font-medium">{client.name}</div>
                <div className="text-sm text-gray-500 flex items-center gap-4">
                  <span>Code: {client.code}</span>
                  {client.email && <span>Email: {client.email}</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isDropdownOpen && filteredClients.length === 0 && searchQuery && !selectedClient && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 p-3">
          <p className="text-sm text-gray-500 text-center">No clients found</p>
        </div>
      )}
      
      {loading && (
        <div className="mt-1.5 text-sm text-gray-500 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-corporate-secondary border-t-transparent mr-2"></div>
          Loading clients...
        </div>
      )}
      
      {error && (
        <div className="mt-1.5 text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
};

export default ClientSelector;