'use client';

import useReveal from '../hooks/useReveal';
import BrandPhilosophyImage from './brand-philosophy-image';
import BrandPhilosophyContent from './brand-philosophy-content';

export default function BrandPhilosophy() {
  const { reveal } = useReveal();

  return (
    <section
      aria-label="Brand philosophy"
      className="flex min-h-[90vh] w-full items-center bg-background py-0 lg:min-h-[100vh] lg:py-0"
    >
      <div className="mx-auto grid w-full max-w-[100rem] grid-cols-1 items-center gap-12 px-6 md:px-10 lg:grid-cols-[55fr_45fr] lg:gap-0">
        <BrandPhilosophyImage reveal={reveal} />
        <BrandPhilosophyContent reveal={reveal}/>
      </div>
    </section>
  );
}
