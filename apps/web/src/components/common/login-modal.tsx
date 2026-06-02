'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { GoogleIcon } from '@/components/common/icons/google-icon';
import { useUIStore } from '@/store/ui.store';
import { useModalLogin } from '@/hooks/use-auth';
import { ROUTES } from '@/constants/routes';
import { CONFIG } from '@/constants/config';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal } = useUIStore();
  const { mutate: login, isPending } = useModalLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const handleClose = () => {
    closeLoginModal();
    reset();
  };

  const onSubmit = (data: LoginForm) => {
    login(data, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  return (
    <Dialog open={isLoginModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair font-bold text-navy dark:text-white">
            Welcome back
          </DialogTitle>
          <DialogDescription>
            Sign in to continue to Nuvora
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="modal-email">Email</Label>
            <Input
              id="modal-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="modal-password">Password</Label>
              <Link
                href={ROUTES.FORGOT_PASSWORD}
                className="text-xs text-gold hover:underline"
                onClick={handleClose}
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="modal-password"
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
            className="w-full bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer"
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
              handleClose();
              window.location.href = `${CONFIG.API_URL}/auth/google`;
            }}
          >
            <GoogleIcon className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href={ROUTES.REGISTER}
            className="text-gold hover:underline font-medium"
            onClick={handleClose}
          >
            Sign up
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  );
}
