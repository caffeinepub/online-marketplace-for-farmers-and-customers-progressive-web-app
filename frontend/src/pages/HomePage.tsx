import { useState, useMemo } from 'react';
import { useGetMarketplaceProducts, usePlaceOrder } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Search, ShoppingCart, MapPin, Calendar, Loader2 } from 'lucide-react';
import type { MarketplaceProduct } from '../backend';

export default function HomePage() {
  const { data: products = [], isLoading } = useGetMarketplaceProducts();
  const { identity } = useInternetIdentity();
  const placeOrder = usePlaceOrder();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [farmerFilter, setFarmerFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [orderQuantity, setOrderQuantity] = useState('1');

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ['all', ...Array.from(cats)];
  }, [products]);

  const farmers = useMemo(() => {
    const farmerNames = new Set(products.map((p) => p.farmerName));
    return ['all', ...Array.from(farmerNames)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.farmerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesFarmer = farmerFilter === 'all' || product.farmerName === farmerFilter;
      return matchesSearch && matchesCategory && matchesFarmer;
    });
  }, [products, searchTerm, categoryFilter, farmerFilter]);

  const handleOrderClick = (product: MarketplaceProduct) => {
    if (!identity) {
      toast.error('Please login to place an order');
      return;
    }
    setSelectedProduct(product);
    setOrderQuantity('1');
  };

  const handlePlaceOrder = async () => {
    if (!selectedProduct) return;

    const quantity = BigInt(orderQuantity);
    if (quantity <= 0n) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (quantity > selectedProduct.quantity) {
      toast.error('Not enough stock available');
      return;
    }

    try {
      await placeOrder.mutateAsync({
        productId: selectedProduct.productId,
        quantity,
      });
      toast.success('Order placed successfully!');
      setSelectedProduct(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-background dark:from-green-950/10">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5" />
        <div className="container relative py-12 md:py-20">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                Fresh from the Farm
                <span className="block text-green-600 dark:text-green-400">to Your Table</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-lg">
                Connect directly with local farmers and enjoy the freshest produce. Support sustainable agriculture and
                your community.
              </p>
            </div>
            <div className="relative h-48 md:h-64 rounded-lg overflow-hidden shadow-2xl">
              <img
                src="/assets/generated/marketplace-hero.dim_800x600.jpg"
                alt="Fresh produce"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="border-b border-border/40 bg-card/50 sticky top-0 z-10">
        <div className="container py-4">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            <div className="sm:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products or farmers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={farmerFilter} onValueChange={setFarmerFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Farmer" />
                </SelectTrigger>
                <SelectContent>
                  {farmers.map((farmer) => (
                    <SelectItem key={farmer} value={farmer}>
                      {farmer === 'all' ? 'All Farmers' : farmer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container py-8 md:py-12">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Available Produce</h2>
          <p className="text-muted-foreground mt-2">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <img
              src="/assets/generated/produce-basket.dim_400x400.jpg"
              alt="No products"
              className="w-40 h-40 mx-auto mb-6 rounded-lg opacity-50"
            />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <Card key={product.productId.toString()} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base md:text-lg line-clamp-2">{product.productName}</CardTitle>
                    <Badge variant="secondary" className="shrink-0 text-xs">{product.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">by {product.farmerName}</p>
                </CardHeader>
                <CardContent className="space-y-2 pb-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="line-clamp-1">{product.harvestLocation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 shrink-0" />
                    <span>Harvested: {product.harvestDate}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
                        ${Number(product.pricePerUnit)}
                      </span>
                      <span className="text-xs text-muted-foreground">per unit</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Number(product.quantity)} units available
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="pt-3">
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => handleOrderClick(product)}
                    disabled={product.quantity === 0n}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.quantity === 0n ? 'Out of Stock' : 'Order Now'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Order Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Order</DialogTitle>
            <DialogDescription>
              Order {selectedProduct?.productName} from {selectedProduct?.farmerName}
            </DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Price per unit:</span>
                  <span className="font-medium">${Number(selectedProduct.pricePerUnit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Available:</span>
                  <span className="font-medium">{Number(selectedProduct.quantity)} units</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={Number(selectedProduct.quantity)}
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                />
              </div>

              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${Number(selectedProduct.pricePerUnit) * Number(orderQuantity)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProduct(null)}>
              Cancel
            </Button>
            <Button onClick={handlePlaceOrder} disabled={placeOrder.isPending}>
              {placeOrder.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
