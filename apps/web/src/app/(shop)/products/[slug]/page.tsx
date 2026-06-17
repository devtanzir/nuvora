import { Suspense } from 'react';
import { Metadata } from 'next';
import { ProductDetailContent } from '@/components/product/product-detail-content';
import { productService } from '@/services/product.service';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await productService.getProduct(slug);

    const title = `${product.name} | Nuvora`;
    const description = product.description ?? `Buy ${product.name} at Nuvora. Premium quality, best price.`;
    const images = product.images?.length
      ? [{ url: product.images[0].url }]
      : [];

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images,
      },
    };
  } catch {
    return {
      title: 'Product | Nuvora',
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  return (
    <Suspense fallback={null}>
      <ProductDetailContent slug={slug} />
    </Suspense>
  );
}