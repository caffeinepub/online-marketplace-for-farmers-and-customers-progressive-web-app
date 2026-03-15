import { useState } from 'react';
import { useSaveCallerUserProfile, useRegisterFarmer } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Variant_customer_farmer } from '../backend';
import type { UserProfile } from '../backend';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<'farmer' | 'customer'>('customer');
  const [contactInfo, setContactInfo] = useState('');
  const [farmLocation, setFarmLocation] = useState('');

  const saveProfile = useSaveCallerUserProfile();
  const registerFarmer = useRegisterFarmer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (userType === 'farmer' && (!contactInfo.trim() || !farmLocation.trim())) {
      toast.error('Please fill in all farmer details');
      return;
    }

    try {
      if (userType === 'farmer') {
        await registerFarmer.mutateAsync({
          name: name.trim(),
          contactInfo: contactInfo.trim(),
          farmLocation: farmLocation.trim(),
        });
      } else {
        const profile: UserProfile = {
          name: name.trim(),
          userType: Variant_customer_farmer.customer,
          contactInfo: contactInfo.trim() || undefined,
          farmLocation: undefined,
        };
        await saveProfile.mutateAsync(profile);
      }
      toast.success('Profile created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create profile');
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to FarmMarket!</DialogTitle>
          <DialogDescription>Let's set up your profile to get started.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>I am a *</Label>
            <RadioGroup value={userType} onValueChange={(value) => setUserType(value as 'farmer' | 'customer')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="customer" id="customer" />
                <Label htmlFor="customer" className="font-normal cursor-pointer">
                  Customer - I want to buy fresh produce
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="farmer" id="farmer" />
                <Label htmlFor="farmer" className="font-normal cursor-pointer">
                  Farmer - I want to sell my produce
                </Label>
              </div>
            </RadioGroup>
          </div>

          {userType === 'farmer' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="contactInfo">Contact Information *</Label>
                <Input
                  id="contactInfo"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="Phone or email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmLocation">Farm Location *</Label>
                <Input
                  id="farmLocation"
                  value={farmLocation}
                  onChange={(e) => setFarmLocation(e.target.value)}
                  placeholder="City, State"
                  required
                />
              </div>
            </>
          )}

          {userType === 'customer' && (
            <div className="space-y-2">
              <Label htmlFor="contactInfoOptional">Contact Information (Optional)</Label>
              <Input
                id="contactInfoOptional"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Phone or email"
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={saveProfile.isPending || registerFarmer.isPending}>
            {saveProfile.isPending || registerFarmer.isPending ? 'Creating Profile...' : 'Create Profile'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
