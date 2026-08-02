'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';
import { SubmitStatus } from '../types/newsletter';
import { ARROW_VARIANTS, HOVER_SPRING } from '../motion/newsletter';




export default function Newsletter() {
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const inputId = useId();
  const statusId = useId();

  const reveal = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.4 },
          transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const, delay },
        };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'submitting' || status === 'success') return;
    setStatus('success');
  }

  return (
    <section
      aria-label="Join the Nuvora journal"
      className="w-full bg-background px-6 py-16 md:px-10 lg:py-20 border-t border-border/50"
    >
      <div className="mx-auto max-w-3xl text-center">
        <motion.span
          {...reveal(0)}
          className="text-xs font-medium uppercase tracking-[0.35em] text-accent/80"
        >
          Newsletter
        </motion.span>

        <motion.h2
          {...reveal(0.1)}
          className="mt-10 font-heading text-[30px] font-light leading-[1.25] text-primary sm:text-[36px] lg:text-[60px] xl:text-[64px]"
        >
          Join the Nuvora Journal
        </motion.h2>

        <motion.p
          {...reveal(0.2)}
          className="mx-auto mt-10 max-w-[38ch] text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          Receive thoughtful editorials, seasonal collections, and quiet updates only when they matter.
        </motion.p>

        <motion.div {...reveal(0.3)} className="mt-[60px]">
          {status === 'success' ? (
            <p role="status" className="text-sm leading-relaxed text-primary">
              Welcome to the Journal. We&apos;ll be in touch only when there&apos;s something worth sharing.
            </p>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <label
                htmlFor={inputId}
                className="block text-left text-[11px] uppercase tracking-[0.25em] text-muted-foreground"
              >
                Email Address
              </label>

              <div className="mt-3 flex items-end gap-4 border-b border-primary/25 pb-3 transition-colors duration-300 focus-within:border-accent">
                <input
                  id={inputId}
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="your@email.com"
                  aria-describedby={status === 'error' ? statusId : undefined}
                  className="min-w-0 flex-1 bg-transparent text-base text-primary outline-none placeholder:text-muted-foreground/50 md:text-lg"
                />

                <motion.button
                  type="submit"
                  disabled={status === 'submitting'}
                  initial="rest"
                  whileHover={reduceMotion ? undefined : 'hover'}
                  whileFocus={reduceMotion ? undefined : 'hover'}
                  className="group inline-flex shrink-0 items-center gap-2 pb-0.5 text-xs font-medium uppercase tracking-[0.25em] text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:opacity-60"
                >
                  <span className="relative">
                    {status === 'submitting' ? 'Joining' : 'Join the Journal'}
                    <motion.span
                      className="absolute inset-x-0 -bottom-0.5 h-px origin-left bg-accent"
                      variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      aria-hidden="true"
                    />
                  </span>
                  <motion.span variants={ARROW_VARIANTS} transition={HOVER_SPRING}>
                    <ArrowRight className="h-4 w-4 text-accent" aria-hidden="true" />
                  </motion.span>
                </motion.button>
              </div>

              {status === 'error' && (
                <p id={statusId} role="alert" className="mt-4 text-left text-sm text-primary/70">
                  Something went wrong. Please try again in a moment.
                </p>
              )}
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
