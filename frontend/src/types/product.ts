type ProductPriceResponse = {
  acronym: string;
  value: number;
  prefix: string;
};

export type ProductResponse = {
  id: number;
  name: string;
  raw_price: number;
  code: string | null;
  expiration: string;
  created_at: string;
  updated_at: string;
  prices: ProductPriceResponse[];
};
