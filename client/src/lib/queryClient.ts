import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { api } from "./api";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Mock apiRequest for frontend-only mode.
 * Returns successful mock Responses for mutations.
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log(`[MOCK API] ${method} ${url}`, data);

  // Return a success response for most mutations in mock mode
  return new Response(JSON.stringify({ message: "Success (Mocked for Frontend-only mode)", data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const url = queryKey[0] as string;
      console.log(`[QUERY FN] Fetching ${url}`);

      // Route specific common GETs to NeonDB direct access if possible
      try {
        if (url === '/api/dashboard' || url === 'stations') return await api.getDashboardData();
        if (url === '/api/stations' || url === 'stations') return await api.getStations();
        if (url === '/api/measurement-types') return await api.getMeasurementTypes();
        if (url === '/api/divisions') return await api.getDivisions();
        if (url === '/api/rti/requests') return await api.getRTIRequests();
        if (url === '/api/documents') return await api.getDocuments();
        if (url === '/api/users') return await api.getUsers();
        if (url.includes('/api/contact/messages')) return await api.getMessages();
        if (url.includes('/api/calendar/events')) return await api.getEvents();

        // Handle dynamic station measurements
        if (url.startsWith('/api/measurements/')) {
          const id = url.split('/').pop();
          if (id) return await api.getMeasurements(id);
        }
      } catch (e) {
        console.warn(`QueryFn failed for ${url} via NeonDB:`, e);
      }

      // Fallback to fetch (which will likely fail if no backend, but handles relative pathing)
      const res = await fetch(url, { credentials: "include" });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
