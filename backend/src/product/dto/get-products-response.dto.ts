class GetProductPricesDTO {
  acronym: string;
  value: number;
  prefix: string;
}

class GetProductsResponseDTO {
  id: number;
  name: string;
  raw_price: number;
  code?: string;
  expiration?: string;
  created_at: Date;
  updated_at: Date;
  prices: GetProductPricesDTO[];
}
