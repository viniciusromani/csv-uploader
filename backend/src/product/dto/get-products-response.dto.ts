class GetProductPricesDTO {
  [acronym: string]: number;
}

class GetProductsResponseDTO {
  id: number;
  name: string;
  code?: string;
  expiration?: string;
  created_at: Date;
  updated_at: Date;
  prices: GetProductPricesDTO;
}
