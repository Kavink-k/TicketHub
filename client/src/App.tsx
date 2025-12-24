import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";

import HomePage from "@/pages/HomePage";
import AuthPage from "@/pages/AuthPage";
import MovieDetailsPage from "@/pages/MovieDetailsPage";
import SeatSelectionPage from "@/pages/SeatSelectionPage";
import BookingSuccessPage from "@/pages/BookingSuccessPage";
import MyBookingsPage from "@/pages/MyBookingsPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/movies/:id" component={MovieDetailsPage} />
      <Route path="/shows/:id/seats">
        <ProtectedRoute>
          <SeatSelectionPage />
        </ProtectedRoute>
      </Route>
      <Route path="/bookings/:id">
        <ProtectedRoute>
          <BookingSuccessPage />
        </ProtectedRoute>
      </Route>
      <Route path="/my-bookings">
        <ProtectedRoute>
          <MyBookingsPage />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
