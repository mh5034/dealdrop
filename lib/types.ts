export type Product = {
  id: string;
  created_at: string;
  user_id: string;
  url: string;
  name: string;
  current_price: number;
  currency: string;
  image_url: string | null;
  updated_at: string;
};

export type PriceHistory = {
  id: string;
  product_id: string;
  price: number;
  currency: string;
  checked_at: string;
};

export type ScrapedProduct = {
  productName: string;
  currentPrice: number;
  currencyCode: string | null;
  productImageUrl: string | null;
};

type ActionError = { success: false; error: string };

type ActionSuccess = { success: true };

export type AddProductResult =
  | ActionError
  | { success: true; product: Product; message: string };

export type DeleteProductResult = ActionSuccess | ActionError;

export type EmailResult = { success: true; data: unknown } | ActionError;
