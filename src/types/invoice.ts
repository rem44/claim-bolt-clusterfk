export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  invoice_date: string;
  currency: string;
  exchange_rate: number | null;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string;
  shipping_code: string | null;
  item_description: string;
  unit_cost_price: number;
  unit_selling_price: number;
  quantity: number;
  total_cost: number;
  total_price: number;
  total_profit: number;
  profit_percentage: number;
  created_at: string;
  updated_at: string;
}