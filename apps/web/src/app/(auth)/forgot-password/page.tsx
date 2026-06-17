'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForgotPassword } from '@/hooks/use-auth';
import { ROUTES } from '@/constants/routes';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { mutate: forgotPassword, isPending, isSuccess } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordForm) => {
    forgotPassword(data.email);
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-playfair font-bold text-navy dark:text-white">
            Check your email
          </h2>
          <p className="text-muted-foreground">
            We&apos;ve sent a password reset link to{' '}
            <strong>{getValues('email')}</strong>. The link will expire in 1
            hour.
          </p>
        </div>
        <Button variant="outline" className="cursor-pointer" asChild>
          <Link href={ROUTES.LOGIN}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-playfair font-bold text-navy dark:text-white">
          Forgot password?
        </h2>
        <p className="text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Mail className="mr-2 h-4 w-4" />
          )}
          Send Reset Link
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href={ROUTES.LOGIN} className="text-gold hover:underline font-medium">
          <ArrowLeft className="inline h-3 w-3 mr-1" />
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}
