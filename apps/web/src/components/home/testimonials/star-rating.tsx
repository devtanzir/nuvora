const StarRating = () => {
  return (
    <div aria-hidden="true" className="select-none text-sm tracking-[0.25em] text-accent">
      ★★★★★
      <span className="sr-only">Rated 5 out of 5</span>
    </div>
  );
}

export default StarRating;
