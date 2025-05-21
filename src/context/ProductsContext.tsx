import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types/product';
import { getProducts, searchProducts } from '../services/productService';

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  searchProductsQuery: (query: string) => Promise<Product[]>;
  refreshProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const searchProductsQuery = async (query: string) => {
    try {
      return await searchProducts(query);
    } catch (err) {
      console.error('Error searching products:', err);
      setError('Failed to search products');
      throw err;
    }
  };

  return (
    <ProductsContext.Provider value={{ 
      products, 
      loading,
      error,
      searchProductsQuery,
      refreshProducts: fetchProducts
    }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};