const NewArrivalsSkeleton = () => {
  return (
    <section className="w-full bg-background py-20">
      <div className="mx-auto max-w-[90rem] px-6">
        <div className="flex gap-6 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] w-1/2 shrink-0 animate-pulse bg-primary/5 md:w-1/3" />
          ))}
        </div>
      </div>
    </section>
  );
}

export default NewArrivalsSkeleton;
