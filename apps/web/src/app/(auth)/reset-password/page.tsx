'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Lock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { useResetPassword } from '@/hooks/use-auth';
import { ROUTES } from '@/constants/routes';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain uppercase letter')
      .regex(/[0-9]/, 'Must contain number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

function ResetPasswordHandler() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const { mutate: resetPassword, isPending, isSuccess } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordForm) => {
    if (!token) return;
    resetPassword({ token, password: data.password });
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">Invalid or missing reset token.</p>
        <Button variant="outline" className="cursor-pointer" asChild>
          <Link href={ROUTES.LOGIN}>Back to Sign In</Link>
        </Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-playfair font-bold text-navy dark:text-white">
            Password reset successful!
          </h2>
          <p className="text-muted-foreground">
            You can now sign in with your new password.
          </p>
        </div>
        <Button
          className="bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer"
          asChild
        >
          <Link href={ROUTES.LOGIN}>Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-playfair font-bold text-navy dark:text-white">
          Reset password
        </h2>
        <p className="text-muted-foreground">Enter your new password below.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
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
            <Lock className="mr-2 h-4 w-4" />
          )}
          Reset Password
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href={ROUTES.LOGIN} className="text-gold hover:underline font-medium">
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      }
    >
      <ResetPasswordHandler />
    </Suspense>
  );
}
