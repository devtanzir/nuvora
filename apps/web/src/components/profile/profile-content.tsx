'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  MapPin,
  Lock,
  Bell,
  Loader2,
  Plus,
  Trash2,
  Check,
  Camera,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { userService } from '@/services/user.service';
import { uploadService } from '@/services/upload.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import { useAuthStore } from '@/store/auth.store';
import { Address } from '@/types/order.types';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import getErrorMessage from '@/lib/error';

// ─── Schemas ──────────────────────────────────────────────────────
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain uppercase letter')
      .regex(/[0-9]/, 'Must contain number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  phone: z.string().min(10, 'Valid phone required'),
  street: z.string().min(5, 'Street address required'),
  city: z.string().min(2, 'City required'),
  district: z.string().min(2, 'District required'),
  postalCode: z.string().min(4, 'Postal code required'),
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;
type AddressForm = z.infer<typeof addressSchema>;

export function ProfileContent() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // ─── Queries ────────────────────────────────────────────────────
  const { data: addresses, isLoading: isLoadingAddresses } = useQuery({
    queryKey: QUERY_KEYS.ADDRESSES,
    queryFn: userService.getAddresses,
  });

  const { data: notifications, isLoading: isLoadingNotifications } = useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS(),
    queryFn: () => userService.getNotifications({ limit: 10 }),
  });

  // ─── Mutations ──────────────────────────────────────────────────
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (data) => {
      updateUser(data);
      toast.success('Profile updated successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to update profile'));
    },
  });

  const { mutate: changePassword, isPending: isChangingPassword } = useMutation({
    mutationFn: userService.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully');
      resetPassword();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to change password'));
    },
  });

  const { mutate: createAddress, isPending: isCreatingAddress } = useMutation({
    mutationFn: userService.createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADDRESSES });
      setIsAddressDialogOpen(false);
      resetAddress();
      toast.success('Address added successfully');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to add address'));
    },
  });

  const { mutate: deleteAddress } = useMutation({
    mutationFn: userService.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADDRESSES });
      toast.success('Address deleted');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to delete address'));
    },
  });

  const { mutate: setDefaultAddress } = useMutation({
    mutationFn: userService.setDefaultAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADDRESSES });
      toast.success('Default address updated');
    },
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: userService.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS() });
    },
  });

  // ─── Avatar Upload ───────────────────────────────────────────────
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const { url } = await uploadService.uploadImage(file, 'avatars');
      updateProfile({ avatar: url });
      updateUser({ avatar: url });
      toast.success('Profile picture updated');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // ─── Forms ──────────────────────────────────────────────────────
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '' },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const {
    register: registerAddress,
    handleSubmit: handleAddressSubmit,
    formState: { errors: addressErrors },
    reset: resetAddress,
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            {/* Avatar with upload */}
<div className="relative w-16 h-16">
  <label htmlFor="avatar-upload" className="cursor-pointer block">
    <Avatar className="h-16 w-16 border-2 border-gold">
      <AvatarImage src={user?.avatar ?? ''} />
      <AvatarFallback className="bg-navy text-white text-xl">
        {user?.name?.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
    <div className={cn(
      'absolute bottom-0 right-0 h-5 w-5 rounded-full bg-gold flex items-center justify-center',
      isUploadingAvatar && 'opacity-50',
    )}>
      {isUploadingAvatar ? (
        <Loader2 className="h-3 w-3 text-navy animate-spin" />
      ) : (
        <Camera className="h-3 w-3 text-navy" />
      )}
    </div>
  </label>
  <input
    id="avatar-upload"
    type="file"
    accept="image/jpeg,image/png,image/webp"
    className="hidden"
    onChange={handleAvatarUpload}
    disabled={isUploadingAvatar}
  />
</div>

            <div>
              <h1 className="text-2xl font-playfair font-bold text-navy dark:text-white">
                {user?.name}
              </h1>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Member since {formatDate(user?.createdAt ?? '')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Tabs defaultValue="profile">
          <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0 gap-6 mb-8">
            {[
              { value: 'profile', label: 'Profile', icon: User },
              { value: 'addresses', label: 'Addresses', icon: MapPin },
              { value: 'security', label: 'Security', icon: Lock },
              { value: 'notifications', label: 'Notifications', icon: Bell },
            ].map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-gold data-[state=active]:text-gold data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent pb-3 px-0 cursor-pointer font-medium flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <form
                onSubmit={handleProfileSubmit((data) => updateProfile(data))}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    placeholder="Your name"
                    {...registerProfile('name')}
                  />
                  {profileErrors.name && (
                    <p className="text-sm text-destructive">
                      {profileErrors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email ?? ''} disabled />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <div>
                    <Badge
                      className={
                        user?.role === 'ADMIN'
                          ? 'bg-gold text-navy'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {user?.role}
                    </Badge>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer"
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </form>
            </motion.div>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {addresses?.length ?? 0} / 5 addresses
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddressDialogOpen(true)}
                  disabled={(addresses?.length ?? 0) >= 5}
                  className="cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </div>

              {isLoadingAddresses ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              ) : addresses && addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((address: Address) => (
                    <div
                      key={address.id}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all',
                        address.isDefault
                          ? 'border-gold bg-gold/5'
                          : 'border-border',
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">
                                {address.fullName}
                              </p>
                              {address.isDefault && (
                                <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {address.phone}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {address.street}, {address.city},{' '}
                              {address.district} {address.postalCode}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {!address.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs cursor-pointer"
                              onClick={() =>
                                address.id && setDefaultAddress(address.id)
                              }
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer"
                            onClick={() =>
                              address.id && deleteAddress(address.id)
                            }
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No addresses saved</p>
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="font-medium text-navy dark:text-white">
                Change Password
              </h3>
              <form
                onSubmit={handlePasswordSubmit((data) =>
                  changePassword({
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword,
                  }),
                )}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword('currentPassword')}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-destructive">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword('newPassword')}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-destructive">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword('confirmPassword')}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Change Password
                </Button>
              </form>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {notifications && notifications.unreadCount > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {notifications.unreadCount} unread
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAllRead()}
                    className="cursor-pointer text-xs"
                  >
                    Mark all as read
                  </Button>
                </div>
              )}

              {isLoadingNotifications ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : !notifications ||
                notifications.notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-4 rounded-xl border transition-all',
                        !notification.read
                          ? 'border-gold/30 bg-gold/5'
                          : 'border-border',
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-navy dark:text-white">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-gold shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Address Dialog */}
      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-playfair">Add New Address</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleAddressSubmit((data) =>
              createAddress({ ...data, isDefault: false }),
            )}
            className="space-y-4 mt-2"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  placeholder="Tanzir Ibne Ali"
                  {...registerAddress('fullName')}
                />
                {addressErrors.fullName && (
                  <p className="text-xs text-destructive">
                    {addressErrors.fullName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  placeholder="01XXXXXXXXX"
                  {...registerAddress('phone')}
                />
                {addressErrors.phone && (
                  <p className="text-xs text-destructive">
                    {addressErrors.phone.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Street Address</Label>
              <Input
                placeholder="House 12, Road 4"
                {...registerAddress('street')}
              />
              {addressErrors.street && (
                <p className="text-xs text-destructive">
                  {addressErrors.street.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input placeholder="Dhaka" {...registerAddress('city')} />
                {addressErrors.city && (
                  <p className="text-xs text-destructive">
                    {addressErrors.city.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>District</Label>
                <Input
                  placeholder="Dhaka"
                  {...registerAddress('district')}
                />
                {addressErrors.district && (
                  <p className="text-xs text-destructive">
                    {addressErrors.district.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Postal Code</Label>
                <Input
                  placeholder="1216"
                  {...registerAddress('postalCode')}
                />
                {addressErrors.postalCode && (
                  <p className="text-xs text-destructive">
                    {addressErrors.postalCode.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 cursor-pointer"
                onClick={() => {
                  setIsAddressDialogOpen(false);
                  resetAddress();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-navy hover:bg-navy-light text-white cursor-pointer"
                disabled={isCreatingAddress}
              >
                {isCreatingAddress && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Address
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
