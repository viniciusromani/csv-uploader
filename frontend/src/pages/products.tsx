import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/shadcn';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/shadcn';
import { formatCurrency, formatDate } from '@/lib/format';
import { ProductResponse } from '@/types/product';
import { ErrorDialog } from '@/components/custom';
import { getAPIURL } from '@/lib/config';

function Products() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<ProductResponse[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { API_URL } = getAPIURL();
        const result = await fetch(`${API_URL}/products`, {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        });
        if (!result.ok) {
          throw new Error(`HTTP error! status: ${result.status}`);
        }
        const body = await result.json();
        setProducts(body);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.name === 'AbortError' ? 'Request timeout' : error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return (
    <div className="container mx-auto my-8 space-y-8 flex-1">
      <h1>Products</h1>
      {loading ? (
        <SkeletonTable />
      ) : (
        <>
          <Table>
            <TableCaption>A list of products</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-center">Code</TableHead>
                <TableHead className="text-center">Expiration</TableHead>
                {products[0].prices.map((price) => (
                  <TableHead key={price.acronym} className="text-center">
                    {price.acronym}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="p-4">{product.name}</TableCell>
                  <TableCell className="p-4 text-center">{product.code ? product.code : '-'}</TableCell>
                  <TableCell className="p-4 text-center">{formatDate(product.expiration)}</TableCell>
                  {product.prices.map((price) => (
                    <TableCell key={`${product.id}.${price.acronym}`} className="p-4 text-center">
                      {formatCurrency(price.prefix, price.value)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ErrorDialog
            open={error.length > 0}
            message={error}
            setOpen={(_) => setError('')}
            onClose={() => setError('')}
          />
        </>
      )}
    </div>
  );
}

function SkeletonTable() {
  const lines = 6;

  return (
    <div className="space-y-4">
      <Skeleton className="h-12" />
      {[...Array(lines).keys()].map((index) => (
        <Skeleton key={`skeleton-${index}`} className="h-8" />
      ))}
    </div>
  );
}

export default Products;
