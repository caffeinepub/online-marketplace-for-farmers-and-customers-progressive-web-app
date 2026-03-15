import { useState } from 'react';
import { useAddProduct, useGetCallerUserProfile } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Loader2, AlertCircle, Sprout } from 'lucide-react';
import { Variant_customer_farmer } from '../backend';

export default function AddProducePage() {
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const addProduct = useAddProduct();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    pricePerUnit: '',
    harvestDate: '',
    harvestLocation: '',
  });

  const isFarmer = userProfile?.userType === Variant_customer_farmer.farmer;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.category.trim() || !formData.harvestLocation.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const quantity = parseInt(formData.quantity);
    const pricePerUnit = parseInt(formData.pricePerUnit);

    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (isNaN(pricePerUnit) || pricePerUnit <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      await addProduct.mutateAsync({
        name: formData.name.trim(),
        category: formData.category.trim(),
        quantity: BigInt(quantity),
        pricePerUnit: BigInt(pricePerUnit),
        harvestDate: formData.harvestDate || new Date().toISOString().split('T')[0],
        harvestLocation: formData.harvestLocation.trim(),
      });

      toast.success('Product added successfully!');
      navigate({ to: '/farmer-dashboard' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to add product');
    }
  };

  if (profileLoading) {
    return (
      <div className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!isFarmer) {
    return (
      <div className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only farmers can add produce. Please register as a farmer to access this feature.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-background dark:from-green-950/10">
      <div className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <Sprout className="h-8 w-8 md:h-10 md:w-10 text-green-600 dark:text-green-400" />
              Add New Produce
            </h1>
            <p className="text-muted-foreground mt-2">List your fresh produce for customers to discover</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>Fill in the information about your produce</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Organic Tomatoes"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Vegetables, Fruits"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity (units) *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="100"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pricePerUnit">Price per Unit ($) *</Label>
                    <Input
                      id="pricePerUnit"
                      type="number"
                      min="1"
                      value={formData.pricePerUnit}
                      onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                      placeholder="5"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="harvestDate">Harvest Date</Label>
                    <Input
                      id="harvestDate"
                      type="date"
                      value={formData.harvestDate}
                      onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="harvestLocation">Harvest Location *</Label>
                    <Input
                      id="harvestLocation"
                      value={formData.harvestLocation}
                      onChange={(e) => setFormData({ ...formData, harvestLocation: e.target.value })}
                      placeholder="e.g., Green Valley Farm"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button type="submit" disabled={addProduct.isPending} className="flex-1">
                    {addProduct.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Add Product
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate({ to: '/farmer-dashboard' })}
                    disabled={addProduct.isPending}
                    className="flex-1 sm:flex-initial"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
