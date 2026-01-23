import ProductDetails from './product-details';

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return <ProductDetails slug={params.slug} />;
}
