import { useGetCallerUserProfile, useGetFarmerProducts, useGetFarmerOrders } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, ShoppingBag, DollarSign, Plus, AlertCircle } from 'lucide-react';
import { Variant_customer_farmer } from '../backend';

export default function FarmerDashboardPage() {
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: products = [], isLoading: productsLoading } = useGetFarmerProducts();
  const { data: orders = [], isLoading: ordersLoading } = useGetFarmerOrders();
  const navigate = useNavigate();

  const isFarmer = userProfile?.userType === Variant_customer_farmer.farmer;

  if (profileLoading) {
    return (
      <div className="container py-8 md:py-12">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!isFarmer) {
    return (
      <div className="container py-8 md:py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This page is only accessible to farmers. Please register as a farmer to access this dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalProducts = products.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.orderStatus === 'pending').length;
  const totalRevenue = orders
    .filter((o) => o.orderStatus === 'completed')
    .reduce((sum, order) => sum + Number(order.totalPrice), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-background dark:from-green-950/10">
      <div className="container py-8 md:py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Farmer Dashboard</h1>
            <p className="text-muted-foreground mt-2">Welcome back, {userProfile?.name}!</p>
          </div>
          <Button onClick={() => navigate({ to: '/add-produce' })} size="sm" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Produce
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6 md:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">Active listings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">{pendingOrders} pending</p>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue}</div>
              <p className="text-xs text-muted-foreground">From completed orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Products Section */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold">Your Products</h2>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: '/add-produce' })}>
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </div>

          {productsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                <p className="text-muted-foreground mb-4">Start by adding your first produce listing</p>
                <Button onClick={() => navigate({ to: '/add-produce' })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Produce
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card key={product.id.toString()}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base md:text-lg line-clamp-2">{product.name}</CardTitle>
                      <Badge variant="secondary" className="shrink-0 text-xs">{product.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium">${Number(product.pricePerUnit)}/unit</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Stock:</span>
                      <span className="font-medium">{Number(product.quantity)} units</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Harvest Date:</span>
                      <span className="font-medium text-xs">{product.harvestDate}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold">Recent Orders</h2>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: '/orders' })}>
              View All
            </Button>
          </div>

          {ordersLoading ? (
            <Skeleton className="h-64" />
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                <p className="text-muted-foreground">Orders will appear here once customers start buying</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id.toString()} className="p-4 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm md:text-base">Order #{order.id.toString()}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {Number(order.quantity)} units - ${Number(order.totalPrice)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          order.orderStatus === 'completed'
                            ? 'default'
                            : order.orderStatus === 'accepted'
                              ? 'secondary'
                              : 'outline'
                        }
                        className="shrink-0 text-xs"
                      >
                        {order.orderStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
