import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider, createRoute, createRootRoute } from '@tanstack/react-router';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import { Toaster } from '@/components/ui/sonner';

const queryClient = new QueryClient();

// Define root route with Layout
const rootRoute = createRootRoute({
  component: Layout,
});

// Define home route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

// Define booking route
const bookingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/booking',
  component: BookingPage,
});

// Define service detail route
const serviceDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services/$serviceId',
  component: ServiceDetailPage,
});

// Create router
const routeTree = rootRoute.addChildren([indexRoute, bookingRoute, serviceDetailRoute]);
const router = createRouter({ routeTree });

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
