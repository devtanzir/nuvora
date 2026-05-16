'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '@/hooks/use-auth';
import { ROUTES } from '@/constants/routes';
import { GoogleIcon } from '@/components/common/icons/google-icon';
import { CONFIG } from '@/constants/config';
import { PasswordInput } from '@/components/ui/password-input';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { mutate: login, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => login(data);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-playfair font-bold text-navy dark:text-white">
          Welcome back
        </h2>
        <p className="text-muted-foreground">Sign in to your Nuvora account</p>
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-sm text-gold hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            autoComplete="current-password"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-navy hover:bg-navy-light text-white cursor-pointer dark:bg-gold dark:hover:bg-gold dark:text-navy"
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full cursor-pointer"
          onClick={() => {
            window.location.href = `${CONFIG.API_URL}/auth/google`;
          }}
        >
          <GoogleIcon className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground cursor-pointer">
        Don&apos;t have an account?{' '}
        <Link
          href={ROUTES.REGISTER}
          className="text-gold hover:underline font-medium"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
