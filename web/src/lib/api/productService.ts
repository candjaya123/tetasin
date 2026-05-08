import { createClient } from '../supabase/client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const getHeaders = async () => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No session found');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };
};

export const productService = {
  async getProducts() {
    const response = await fetch(`${BACKEND_URL}/api/v1/inventory/products`, {
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async createProduct(data: {
    p_name: string;
    p_selling_price: number;
    p_recipe: any[];
    p_barcode?: string;
  }) {
    const response = await fetch(`${BACKEND_URL}/api/v1/inventory/products`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create product');
    }
    return response.json();
  },

  async updateProduct(id: string, data: any) {
    const response = await fetch(`${BACKEND_URL}/api/v1/inventory/products/${id}`, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update product');
    return response.json();
  },

  async deleteProduct(id: string) {
    const response = await fetch(`${BACKEND_URL}/api/v1/inventory/products/${id}`, {
      method: 'DELETE',
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete product');
    return response.json();
  },

  async getRawMaterials() {
    const response = await fetch(`${BACKEND_URL}/api/v1/inventory/raw-materials`, {
      headers: await getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch raw materials');
    return response.json();
  }
};
