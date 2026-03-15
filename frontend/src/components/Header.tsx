import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Sprout, User, ShoppingBag, Package, Home } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Variant_customer_farmer } from '../backend';

export default function Header() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const routerState = useRouterState();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const isFarmer = userProfile?.userType === Variant_customer_farmer.farmer;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const currentPath = routerState.location.pathname;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity"
          >
            <Sprout className="h-6 w-6" />
            <span className="hidden sm:inline">FarmMarket</span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant={currentPath === '/' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => navigate({ to: '/' })}
            >
              <Home className="h-4 w-4 mr-2" />
              Marketplace
            </Button>

            {isAuthenticated && isFarmer && (
              <>
                <Button
                  variant={currentPath === '/farmer-dashboard' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => navigate({ to: '/farmer-dashboard' })}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant={currentPath === '/add-produce' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => navigate({ to: '/add-produce' })}
                >
                  <Sprout className="h-4 w-4 mr-2" />
                  Add Produce
                </Button>
              </>
            )}

            {isAuthenticated && (
              <Button
                variant={currentPath === '/orders' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => navigate({ to: '/orders' })}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Orders
              </Button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && userProfile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{userProfile.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm font-medium">{userProfile.name}</div>
                <div className="px-2 py-1 text-xs text-muted-foreground">
                  {isFarmer ? 'Farmer' : 'Customer'}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: '/profile' })}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/orders' })}>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Orders
                </DropdownMenuItem>
                {isFarmer && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate({ to: '/farmer-dashboard' })}>
                      <Package className="h-4 w-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate({ to: '/add-produce' })}>
                      <Sprout className="h-4 w-4 mr-2" />
                      Add Produce
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleAuth}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={handleAuth} disabled={disabled} size="sm">
              {loginStatus === 'logging-in' ? 'Logging in...' : 'Login'}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
