import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { productService } from '@/services/product.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import { ROUTES } from '@/constants/routes';
import { useDebounce } from '@/hooks/use-debounce';
import { useUIStore } from '@/store/ui.store';

const useSearch = () => {
    const router = useRouter();
  const { isSearchOpen, closeSearch } = useUIStore();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.PRODUCTS({ search: debouncedQuery, limit: 6 }),
    queryFn: () => productService.getProducts({ search: debouncedQuery, limit: 6 }),
    enabled: debouncedQuery.length >= 2,
  });

  const handleSelect = (slug: string) => {
    router.push(ROUTES.PRODUCT(slug));
    closeSearch();
    setQuery('');
  };

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(query)}`);
      closeSearch();
      setQuery('');
    }
  };

  useEffect(() => {
    if (!isSearchOpen) setQuery('');
  }, [isSearchOpen]);

  return {
query,
setQuery,
data,
isLoading,
handleSelect,
handleSearch,
isSearchOpen,
closeSearch,
debouncedQuery,
  }
};

export default useSearch;
