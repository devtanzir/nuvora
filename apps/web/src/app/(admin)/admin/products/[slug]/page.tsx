import { ProductFormContent } from "@/components/admin/products/product-form-content";
import { Suspense } from "react";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { slug } = await params;
  return (
    <Suspense fallback={null}>
      <ProductFormContent productSlug={slug} />
    </Suspense>
  );
}
