const CollectionSkeleton = ({ count }: { count: number }) => {
  return (
    <>
      <div className="hidden lg:grid lg:h-[860px] lg:grid-cols-12 lg:grid-rows-2 lg:gap-4 xl:gap-5">
        <div className="animate-pulse bg-primary/5 lg:col-span-7 lg:row-span-2" />
        <div className="animate-pulse bg-primary/5 lg:col-span-5 lg:row-span-1" />
        <div className="lg:col-span-5 lg:row-span-1 lg:grid lg:grid-cols-2 lg:gap-4 xl:gap-5">
          <div className="animate-pulse bg-primary/5" />
          <div className="animate-pulse bg-primary/5" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:hidden">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="aspect-[5/8] w-full animate-pulse bg-primary/5" />
        ))}
      </div>
    </>
  );
}

export default CollectionSkeleton;
