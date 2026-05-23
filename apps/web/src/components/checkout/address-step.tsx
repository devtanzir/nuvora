'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, MapPin, Check, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { userService } from '@/services/user.service';
import { QUERY_KEYS } from '@/constants/query-keys';
import { Address } from '@/types/order.types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import getErrorMessage from '@/lib/error';

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  phone: z.string().min(10, 'Valid phone number required'),
  street: z.string().min(5, 'Street address required'),
  city: z.string().min(2, 'City required'),
  district: z.string().min(2, 'District required'),
  postalCode: z.string().min(4, 'Postal code required'),
});

type AddressForm = z.infer<typeof addressSchema>;

interface AddressStepProps {
  selectedAddress: Address | null;
  onSelect: (address: Address) => void;
  onNext: () => void;
}

export function AddressStep({
  selectedAddress,
  onSelect,
  onNext,
}: AddressStepProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: addresses, isLoading } = useQuery({
    queryKey: QUERY_KEYS.ADDRESSES,
    queryFn: userService.getAddresses,
  });

  const { mutate: createAddress, isPending: isCreating } = useMutation({
    mutationFn: userService.createAddress,
    onSuccess: (newAddress) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADDRESSES });
      onSelect(newAddress);
      setIsDialogOpen(false);
      reset();
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
  });

  const onSubmit = (data: AddressForm) => {
    createAddress({ ...data, isDefault: false });
  };

  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddress) {
      const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
      onSelect(defaultAddress);
    }
  }, [addresses, onSelect, selectedAddress]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-playfair font-bold text-navy dark:text-white">
          Delivery Address
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className="cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : addresses && addresses.length > 0 ? (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              onClick={() => onSelect(address)}
              className={cn(
                'relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200',
                selectedAddress?.id === address.id
                  ? 'border-gold bg-gold/5'
                  : 'border-border hover:border-gold/50',
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-navy dark:text-white">
                        {address.fullName}
                      </p>
                      {address.isDefault && (
                        <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded-full font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {address.phone}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.street}, {address.city}, {address.district}{' '}
                      {address.postalCode}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {selectedAddress?.id === address.id && (
                    <div className="h-6 w-6 rounded-full bg-gold flex items-center justify-center">
                      <Check className="h-3 w-3 text-navy" />
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (address.id) deleteAddress(address.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 space-y-3">
          <MapPin className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground">No addresses saved yet</p>
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(true)}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Address
          </Button>
        </div>
      )}

      <Button
        className="w-full bg-navy hover:bg-navy-light dark:bg-gold dark:hover:bg-gold-dark dark:text-navy text-white cursor-pointer"
        disabled={!selectedAddress}
        onClick={onNext}
      >
        Continue to Review
      </Button>

      {/* Add Address Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-playfair">Add New Address</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  placeholder="Tanzir Ibne Ali"
                  {...register('fullName')}
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive">
                    {errors.fullName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="01XXXXXXXXX" {...register('phone')} />
                {errors.phone && (
                  <p className="text-xs text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Street Address</Label>
              <Input placeholder="House 12, Road 4" {...register('street')} />
              {errors.street && (
                <p className="text-xs text-destructive">
                  {errors.street.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input placeholder="Dhaka" {...register('city')} />
                {errors.city && (
                  <p className="text-xs text-destructive">
                    {errors.city.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>District</Label>
                <Input placeholder="Dhaka" {...register('district')} />
                {errors.district && (
                  <p className="text-xs text-destructive">
                    {errors.district.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Postal Code</Label>
                <Input placeholder="1216" {...register('postalCode')} />
                {errors.postalCode && (
                  <p className="text-xs text-destructive">
                    {errors.postalCode.message}
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
                  setIsDialogOpen(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-navy hover:bg-navy-light text-white cursor-pointer"
                disabled={isCreating}
              >
                {isCreating && (
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
