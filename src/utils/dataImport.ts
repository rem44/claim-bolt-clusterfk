import { supabase } from '../lib/supabase';
import { Client } from '../types/client';
import { Product } from '../types/product';
import { Invoice, InvoiceItem } from '../types/invoice';

// Function to import clients from CSV data
export async function importClients(clientsData: any[]) {
  const clients = clientsData.map(client => ({
    name: client.cr72e_clientname || '',
    code: client.cr72e_clientid || '',
    // Add other fields as needed
  }));

  // Filter out duplicates based on code
  const uniqueClients = clients.filter((client, index, self) => 
    client.code && 
    index === self.findIndex(c => c.code === client.code)
  );

  // Insert clients
  const { data, error } = await supabase
    .from('clients')
    .insert(uniqueClients);

  if (error) {
    console.error('Error importing clients:', error);
    throw error;
  }

  return data;
}

// Function to import products from CSV data
export async function importProducts(productsData: any[]) {
  const products = productsData.map(product => ({
    code: product.cr72e_codeitem || '',
    color: product.cr72e_color || '',
    color_number: product.cr72e_colornum || '',
    description: product.cr72e_description || '',
    format: product.cr72e_format || '',
    style: product.cr72e_style || '',
    style_number: product.cr72e_stylenum || '',
  }));

  // Filter out duplicates based on code
  const uniqueProducts = products.filter((product, index, self) => 
    product.code && 
    index === self.findIndex(p => p.code === product.code)
  );

  // Insert products
  const { data, error } = await supabase
    .from('products')
    .insert(uniqueProducts);

  if (error) {
    console.error('Error importing products:', error);
    throw error;
  }

  return data;
}

// Function to import invoices and invoice items from CSV data
export async function importInvoices(invoicesData: any[]) {
  // Group by invoice number
  const invoiceGroups = invoicesData.reduce((acc, item) => {
    const invoiceNumber = item.cr72e_invoicenumber;
    if (!acc[invoiceNumber]) {
      acc[invoiceNumber] = [];
    }
    acc[invoiceNumber].push(item);
    return acc;
  }, {});

  // Process each invoice
  for (const [invoiceNumber, items] of Object.entries(invoiceGroups)) {
    const firstItem = items[0];
    
    // Get or create client
    let clientId;
    if (firstItem.cr72e_clientid) {
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('code', firstItem.cr72e_clientid)
        .single();
      
      if (existingClient) {
        clientId = existingClient.id;
      } else {
        // Create new client
        const { data: newClient, error } = await supabase
          .from('clients')
          .insert({
            name: firstItem.cr72e_clientname || 'Unknown Client',
            code: firstItem.cr72e_clientid || `UNKNOWN-${Math.random().toString(36).substring(2, 9)}`,
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error creating client:', error);
          continue;
        }
        
        clientId = newClient.id;
      }
    } else {
      // Skip if no client info
      console.warn(`Skipping invoice ${invoiceNumber} - no client information`);
      continue;
    }
    
    // Create invoice
    const invoiceDate = firstItem.cr72e_invoicedate 
      ? new Date(firstItem.cr72e_invoicedate).toISOString() 
      : new Date().toISOString();
    
    const totalAmount = items.reduce((sum, item) => {
      return sum + (parseFloat(item.cr72e_totalnet) || 0);
    }, 0);
    
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        client_id: clientId,
        invoice_date: invoiceDate,
        currency: firstItem.cr72e_currency || 'USD',
        exchange_rate: parseFloat(firstItem.exchangerate) || 1,
        total_amount: totalAmount,
      })
      .select()
      .single();
    
    if (invoiceError) {
      console.error(`Error creating invoice ${invoiceNumber}:`, invoiceError);
      continue;
    }
    
    // Process invoice items
    for (const item of items) {
      // Get or create product
      let productId;
      if (item.cr72e_itemcode) {
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('code', item.cr72e_itemcode)
          .single();
        
        if (existingProduct) {
          productId = existingProduct.id;
        } else {
          // Create new product
          const { data: newProduct, error } = await supabase
            .from('products')
            .insert({
              code: item.cr72e_itemcode,
              color: item.cr72e_color || '',
              color_number: '',
              description: item.cr72e_itemdescription || item.cr72e_itemcode,
              format: '',
              style: item.cr72e_style || '',
              style_number: '',
            })
            .select()
            .single();
          
          if (error) {
            console.error('Error creating product:', error);
            continue;
          }
          
          productId = newProduct.id;
        }
      } else {
        // Skip if no product info
        console.warn(`Skipping item in invoice ${invoiceNumber} - no product information`);
        continue;
      }
      
      // Create invoice item
      const unitCostPrice = parseFloat(item.cr72e_costingunitprice) || 0;
      const unitSellingPrice = parseFloat(item.cr72e_unitsellingprice) || 0;
      const quantity = parseFloat(item.cr72e_quantity) || 0;
      const totalCost = parseFloat(item.cr72e_totalcosting) || 0;
      const totalPrice = parseFloat(item.cr72e_totalnet) || 0;
      const totalProfit = parseFloat(item.cr72e_totalprofit) || 0;
      const profitPercentage = parseFloat(item.cr72e_totalprofitpercentage) || 0;
      
      const { error: itemError } = await supabase
        .from('invoice_items')
        .insert({
          invoice_id: invoice.id,
          product_id: productId,
          shipping_code: item.cr72e_shippingcode || null,
          item_description: item.cr72e_itemdescription || '',
          unit_cost_price: unitCostPrice,
          unit_selling_price: unitSellingPrice,
          quantity: quantity,
          total_cost: totalCost,
          total_price: totalPrice,
          total_profit: totalProfit,
          profit_percentage: profitPercentage,
        });
      
      if (itemError) {
        console.error(`Error creating invoice item for ${invoiceNumber}:`, itemError);
      }
    }
  }
}