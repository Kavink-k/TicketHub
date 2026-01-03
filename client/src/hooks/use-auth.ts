import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loginUser, signupUser, getCurrentUser, logoutUser, isAuthenticated } from "@/lib/data-service";
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
    queryKey: ["currentUser"],
    queryFn: () => {
      if (!isAuthenticated()) return null;
      return getCurrentUser();
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const result = loginUser(credentials.username, credentials.password);
      if (!result) {
        throw new Error("Invalid credentials");
      }
      return result;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["currentUser"], data.user);
      toast({ title: "Welcome back!", description: `Logged in as ${data.user.name}` });
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
    mutationFn: async (data: { email: string; password: string; name: string }) => {
      const result = signupUser(data);
      if (!result) {
        throw new Error("Email already exists");
      }
      return result;
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
      logoutUser();
    },
    onSuccess: () => {
      queryClient.setQueryData(["currentUser"], null);
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
