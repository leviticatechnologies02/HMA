import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,   // 5 min — master prompt spec
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1A1A2E",
            color: "#fff",
            borderRadius: "12px",
            fontSize: "14px",
            fontFamily: "Satoshi, Inter, sans-serif",
          },
          success: { 
            iconTheme: { primary: "#06D6A0", secondary: "#fff" },
            style: {
              background: "#1A1A2E",
              color: "#fff",
            },
          },
          error: { 
            iconTheme: { primary: "#EF476F", secondary: "#fff" },
            style: {
              background: "#1A1A2E",
              color: "#fff",
            },
          },
          // Remove 'info' - it doesn't exist in react-hot-toast
          // For info messages, use default toast or create custom
          blank: {
            iconTheme: { primary: "#118AB2", secondary: "#fff" },
            style: {
              background: "#1A1A2E",
              color: "#fff",
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}