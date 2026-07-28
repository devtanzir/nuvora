'use client';

import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import EditorialIntro from './editorial-intro';
import NewArrivalsExperience from './new-arrivals-experience';
import NewArrivalsSkeleton from './new-arrivals-skeleton';
import Error from "./error"


const NewArrivals = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', 'new-arrivals'],
    queryFn: () => productService.getProducts({ sortBy: 'newest', limit: 6 }),
  });

  const products = data?.products ?? [];

  if (isError) {
    return (
      <Error refetch={refetch}/>
    );
  }

  if (isLoading) return <NewArrivalsSkeleton />;

  if (products.length === 0) {
    return (
      <section className="w-full bg-background py-24">
        <div className="mx-auto max-w-[90rem] px-6 text-center">
          <p className="text-sm text-muted-foreground">No new arrivals available yet.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <EditorialIntro />
      <NewArrivalsExperience products={products} />
    </>
  );
}

export default NewArrivals
