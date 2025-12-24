import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertUser } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// Types
export type LoginInput = {
  username: string;
  password: string;
};

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const res = await fetch(api.auth.me.path, {
        credentials: 'include', // Important for cookies/sessions
      });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return api.auth.me.responses[200].parse(await res.json());
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Important for cookies/sessions
        body: JSON.stringify(credentials),
      });
      
      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid credentials");
        if (res.status === 500) throw new Error("Server error - please try again");
        throw new Error("Login failed");
      }
      
      return api.auth.login.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.auth.me.path], data);
      toast({ title: "Welcome back!", description: `Logged in as ${data.name}` });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Login Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await fetch(api.auth.signup.path, {
        method: api.auth.signup.method,
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Important for cookies/sessions
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation error");
        }
        if (res.status === 500) throw new Error("Server error - please try again");
        throw new Error("Signup failed");
      }
      
      return api.auth.signup.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({ title: "Account Created", description: "Please login to continue." });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Signup Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch(api.auth.logout.path, { 
        method: api.auth.logout.method,
        credentials: 'include', // Important for cookies/sessions
      });
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.me.path], null);
      toast({ title: "Logged out", description: "See you next time!" });
    },
  });

  return {
    user,
    isLoading,
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isSigningUp: signupMutation.isPending,
  };
}
