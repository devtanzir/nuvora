const Error = ({refetch}: {refetch: () => void}) => {
  return (
    <>
   <section className="w-full bg-background py-24">
        <div className="mx-auto flex max-w-[90rem] flex-col items-center gap-4 px-6 text-center">
          <p className="text-sm text-muted-foreground">We couldn&apos;t load new arrivals right now.</p>
          <button
            onClick={() => refetch()}
            className="text-xs font-medium uppercase tracking-[0.2em] text-accent transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-primary"
          >
            Try Again
          </button>
        </div>
      </section>
    </>
  );
};

export default Error;
