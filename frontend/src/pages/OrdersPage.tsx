import { useGetCallerUserProfile, useGetUserOrders, useGetFarmerOrders, useUpdateOrderStatus } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { ShoppingBag, Package, AlertCircle, Loader2 } from 'lucide-react';
import { OrderStatus } from '../backend';
import type { Order } from '../backend';

export default function OrdersPage() {
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: customerOrders = [], isLoading: customerOrdersLoading } = useGetUserOrders();
  const { data: farmerOrders = [], isLoading: farmerOrdersLoading } = useGetFarmerOrders();
  const updateOrderStatus = useUpdateOrderStatus();

  const isFarmer = userProfile?.userType === 'farmer';

  const handleUpdateStatus = async (orderId: bigint, status: OrderStatus) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status });
      toast.success('Order status updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update order status');
    }
  };

  const renderOrderCard = (order: Order, isFarmerView: boolean) => (
    <Card key={order.id.toString()}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base md:text-lg">Order #{order.id.toString()}</CardTitle>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              {new Date(Number(order.orderDate) / 1000000).toLocaleDateString()}
            </p>
          </div>
          <Badge
            variant={
              order.orderStatus === OrderStatus.completed
                ? 'default'
                : order.orderStatus === OrderStatus.accepted
                  ? 'secondary'
                  : 'outline'
            }
            className="shrink-0 text-xs"
          >
            {order.orderStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Product ID:</span>
            <span className="font-medium">#{order.productId.toString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Quantity:</span>
            <span className="font-medium">{Number(order.quantity)} units</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Price:</span>
            <span className="font-medium text-green-600 dark:text-green-400">${Number(order.totalPrice)}</span>
          </div>
        </div>

        {isFarmerView && order.orderStatus === OrderStatus.pending && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handleUpdateStatus(order.id, OrderStatus.accepted)}
              disabled={updateOrderStatus.isPending}
            >
              {updateOrderStatus.isPending && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
              Accept
            </Button>
          </div>
        )}

        {isFarmerView && order.orderStatus === OrderStatus.accepted && (
          <div className="pt-2 border-t">
            <Button
              size="sm"
              className="w-full"
              onClick={() => handleUpdateStatus(order.id, OrderStatus.completed)}
              disabled={updateOrderStatus.isPending}
            >
              {updateOrderStatus.isPending && <Loader2 className="h-3 w-3 mr-2 animate-spin" />}
              Mark as Completed
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (profileLoading) {
    return (
      <div className="container py-8 md:py-12">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container py-8 md:py-12">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please login to view your orders.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-background dark:from-green-950/10">
      <div className="container py-8 md:py-12">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Orders</h1>
          <p className="text-muted-foreground mt-2">Manage and track your orders</p>
        </div>

        {isFarmer ? (
          <Tabs defaultValue="received" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="received" className="text-xs sm:text-sm">
                <Package className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Orders </span>Received
              </TabsTrigger>
              <TabsTrigger value="placed" className="text-xs sm:text-sm">
                <ShoppingBag className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Orders </span>Placed
              </TabsTrigger>
            </TabsList>

            <TabsContent value="received" className="space-y-6">
              {farmerOrdersLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-64" />
                  ))}
                </div>
              ) : farmerOrders.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No orders received yet</h3>
                    <p className="text-muted-foreground">Orders from customers will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {farmerOrders.map((order) => renderOrderCard(order, true))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="placed" className="space-y-6">
              {customerOrdersLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-64" />
                  ))}
                </div>
              ) : customerOrders.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No orders placed yet</h3>
                    <p className="text-muted-foreground">Your orders will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {customerOrders.map((order) => renderOrderCard(order, false))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div>
            {customerOrdersLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : customerOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                  <p className="text-muted-foreground">Start shopping to place your first order</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {customerOrders.map((order) => renderOrderCard(order, false))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
