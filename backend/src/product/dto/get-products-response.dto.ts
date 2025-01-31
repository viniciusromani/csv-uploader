class GetProductPricesDTO {
  [acronym: string]: number;
}

class GetProductsResponseDTO {
  id: number;
  name: string;
  raw_price: number;
  code?: string;
  expiration?: string;
  created_at: Date;
  updated_at: Date;
  prices: GetProductPricesDTO;
}
