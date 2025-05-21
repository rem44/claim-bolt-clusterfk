import React, { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductsContext';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

const ProductsPage: React.FC = () => {
  const { products, loading, error, refreshProducts } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('style');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState({
    format: '',
    style: '',
  });

  useEffect(() => {
    refreshProducts();
  }, []);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredProducts = products.filter(product => {
    return (
      (searchQuery === '' || 
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.style.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.color.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filters.format === '' || product.format === filters.format) &&
      (filters.style === '' || product.style === filters.style)
    );
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'code':
        comparison = a.code.localeCompare(b.code);
        break;
      case 'description':
        comparison = a.description.localeCompare(b.description);
        break;
      case 'style':
        comparison = a.style.localeCompare(b.style);
        break;
      case 'color':
        comparison = a.color.localeCompare(b.color);
        break;
      case 'format':
        comparison = a.format.localeCompare(b.format);
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const uniqueFormats = Array.from(new Set(products.map(product => product.format)));
  const uniqueStyles = Array.from(new Set(products.map(product => product.style)));

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
      <h1 className="text-2xl font-semibold mb-6">Products Catalog</h1>
      
      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search products..."
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
                value={filters.format}
                onChange={(e) => setFilters({...filters, format: e.target.value})}
              >
                <option value="">All Formats</option>
                {uniqueFormats.map((format, index) => (
                  <option key={index} value={format}>{format}</option>
                ))}
              </select>
            </div>
            <div>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={filters.style}
                onChange={(e) => setFilters({...filters, style: e.target.value})}
              >
                <option value="">All Styles</option>
                {uniqueStyles.map((style, index) => (
                  <option key={index} value={style}>{style}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader
                  title="Code"
                  field="code"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  title="Description"
                  field="description"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  title="Style"
                  field="style"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  title="Style #"
                  field="style_number"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  title="Color"
                  field="color"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  title="Color #"
                  field="color_number"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  title="Format"
                  field="format"
                  currentSort={sortField}
                  direction={sortDirection}
                  onSort={handleSort}
                />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedProducts.map((product, index) => (
                <tr 
                  key={product.id} 
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-150`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.style}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.style_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.color}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.color_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.format}
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

export default ProductsPage;