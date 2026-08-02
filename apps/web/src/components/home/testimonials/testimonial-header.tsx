import { motion } from 'framer-motion';

const TestimonialHeader = ({
  reveal,
}: {
  reveal: (num: number) => Record<string, unknown>;
}) => {
  return (
    <>
      <div className="mx-auto max-w-5xl text-center">
        <motion.span
          {...reveal(0)}
          className="text-xs font-medium uppercase tracking-[0.35em] text-accent/80"
        >
          What People Say
        </motion.span>
        <motion.h2
          {...reveal(0.1)}
          className="mt-7 font-heading text-[40px] font-light leading-[1.2] text-primary sm:text-[52px] lg:text-[60px] xl:text-[64px]"
        >
          Designed for people
          <br />
          who appreciate timeless quality.
        </motion.h2>
        <motion.p
          {...reveal(0.2)}
          className="mx-auto mt-6 max-w-[42ch] text-base leading-relaxed text-muted-foreground"
        >
          A few words from those who&apos;ve lived with the pieces, season after
          season.
        </motion.p>
      </div>
    </>
  );
};

export default TestimonialHeader;
