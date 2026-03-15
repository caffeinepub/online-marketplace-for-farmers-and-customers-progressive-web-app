import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, MapPin, Phone, AlertCircle } from 'lucide-react';
import { Variant_customer_farmer } from '../backend';

export default function ProfilePage() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();

  if (isLoading) {
    return (
      <div className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please login to view your profile.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const isFarmer = userProfile.userType === Variant_customer_farmer.farmer;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-background dark:from-green-950/10">
      <div className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">Profile</h1>
            <p className="text-muted-foreground mt-2">Your account information</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-xl md:text-2xl break-words">{userProfile.name}</CardTitle>
                <Badge variant={isFarmer ? 'default' : 'secondary'} className="shrink-0">
                  {isFarmer ? 'Farmer' : 'Customer'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-base break-words">{userProfile.name}</p>
                  </div>
                </div>

                {userProfile.contactInfo && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Contact Information</p>
                      <p className="text-base break-words">{userProfile.contactInfo}</p>
                    </div>
                  </div>
                )}

                {isFarmer && userProfile.farmLocation && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Farm Location</p>
                      <p className="text-base break-words">{userProfile.farmLocation}</p>
                    </div>
                  </div>
                )}
              </div>

              {isFarmer && (
                <div className="pt-6 border-t">
                  <h3 className="font-semibold mb-2">Farmer Benefits</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-600 shrink-0" />
                      List unlimited products
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-600 shrink-0" />
                      Manage orders and inventory
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-600 shrink-0" />
                      Connect directly with customers
                    </li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
