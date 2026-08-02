import { motion } from 'framer-motion'
import Image from 'next/image';

const BrandPhilosophyImage = ({ reveal }: { reveal: (num: number) => Record<string, unknown> }) => {
  const BrandImage = "/images/brand-philosophy.png"
  return (
    <>
        <motion.div
          {...reveal(0)}
          className="relative aspect-[4/5] w-full overflow-hidden bg-primary/5 sm:aspect-[3/4] lg:aspect-auto lg:h-[82vh]"
        >
          <Image
            src={BrandImage}
            alt="A woman in neutral linen tailoring, standing in soft afternoon light against warm stone architecture"
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover object-center"
            priority={false}
          />
        </motion.div>
    </>
  );
};

export default BrandPhilosophyImage;
