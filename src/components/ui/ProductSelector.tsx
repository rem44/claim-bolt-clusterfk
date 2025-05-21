import React, { useState, useEffect } from 'react';
import { useProducts } from '../../context/ProductsContext';
import { Search } from 'lucide-react';
import { Product } from '../../types/product';

interface ProductSelectorProps {
  onProductSelect: (product: Product) => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ onProductSelect }) => {
  const { loading, error, searchProductsQuery } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        try {
          const results = await searchProductsQuery(searchQuery);
          setSearchResults(results);
          setIsDropdownOpen(true);
        } catch (err) {
          console.error('Error searching products:', err);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchProductsQuery]);

  const handleProductSelect = (product: Product) => {
    onProductSelect(product);
    setIsDropdownOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Search Products
      </label>
      <div className="relative">
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsDropdownOpen(true)}
          className="w-full p-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C3B5E] focus:border-transparent"
          placeholder="Search by style, color, or code..."
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
      </div>
      
      {isDropdownOpen && searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
          <ul className="py-1 max-h-60 overflow-auto">
            {searchResults.map((product) => (
              <li
                key={product.id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleProductSelect(product)}
              >
                <div className="font-medium">{product.description}</div>
                <div className="text-sm text-gray-500">
                  {product.style} / {product.color} - {product.code}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {loading && searchQuery.length > 2 && <p className="text-sm text-gray-500 mt-1">Searching products...</p>}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default ProductSelector;