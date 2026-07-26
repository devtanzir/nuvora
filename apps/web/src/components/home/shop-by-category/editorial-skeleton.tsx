const EditorialSkeleton = () => {
  return (
    <div className="flex flex-col gap-20 md:gap-28 xl:gap-32">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-12">
        <div className="aspect-[4/5] animate-pulse bg-primary/5 sm:col-span-8 sm:aspect-auto sm:h-[560px] xl:h-[640px]" />
        <div className="aspect-[4/5] animate-pulse bg-primary/5 sm:col-span-4 sm:aspect-auto sm:h-[420px] sm:self-end xl:h-[460px]" />
      </div>
      <div className="aspect-[16/10] animate-pulse bg-primary/5 sm:aspect-auto sm:h-[380px] xl:h-[440px]" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-12 sm:gap-10 xl:gap-16">
        <div className="aspect-[4/5] animate-pulse bg-primary/5 sm:col-span-5 sm:aspect-auto sm:h-[560px] xl:h-[620px]" />
        <div className="aspect-[4/5] animate-pulse bg-primary/5 sm:col-span-5 sm:col-start-8 sm:aspect-auto sm:h-[560px] sm:mt-16 xl:h-[620px] xl:mt-24" />
      </div>
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-12 sm:items-center sm:gap-8">
        <div className="aspect-[4/5] animate-pulse bg-primary/5 sm:col-span-7 sm:aspect-auto sm:h-[480px] xl:h-[540px]" />
        <div className="h-40 animate-pulse bg-primary/5 sm:col-span-5" />
      </div>
    </div>
  );
}

export default EditorialSkeleton;
