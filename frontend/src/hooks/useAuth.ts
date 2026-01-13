import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { z } from "zod";

// --- Types ---
export interface User {
    id: string;
    email: string;
    role: "CUSTOMER" | "OWNER" | "ADMIN";
    firstName?: string;
    lastName?: string;
}

export type LoginCredentials = {
    email: string;
    password: string;
};

export type RegisterData = {
    email: string;
    password: string;
    role: "CUSTOMER" | "OWNER";
    firstName: string;
    lastName: string;
};

// --- API Functions ---

async function loginUser(credentials: LoginCredentials) {
    const { data } = await api.post("/auth/login", credentials);
    return data;
}

async function registerUser(userData: RegisterData) {
    // Construct payload expected by backend
    const payload = {
        email: userData.email,
        password: userData.password,
        role: userData.role,
        // Add profile data structure as required by backend DTOs
        [userData.role === "OWNER" ? "ownerProfile" : "customerProfile"]: {
            firstName: userData.firstName,
            lastName: userData.lastName,
        }
    };
    const { data } = await api.post("/auth/register", payload);
    return data;
}

async function fetchCurrentUser() {
    const { data } = await api.get("/auth/me");
    return data.data; // Backend wraps response in { success: true, data: ... }
}

async function logoutUser() {
    const refreshToken = localStorage.getItem("refreshToken");
    await api.post("/auth/logout", { refreshToken });
}

// --- Hook ---

export function useAuth() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Get current user
    const { data: user, isLoading: isLoadingUser, error: userError } = useQuery<User>({
        queryKey: ["currentUser"],
        queryFn: fetchCurrentUser,
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 mins
    });

    // Login Mutation
    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (response) => {
            // Store tokens
            localStorage.setItem("accessToken", response.data.accessToken);
            localStorage.setItem("refreshToken", response.data.refreshToken);
            localStorage.setItem("user", JSON.stringify(response.data.user)); // Optional cache

            // Update query cache
            queryClient.setQueryData(["currentUser"], response.data.user);

            // Redirect based on role
            const role = response.data.user.role;
            if (role === "ADMIN") router.push("/dashboard/users");
            else if (role === "OWNER") router.push("/dashboard/banquets");
            else router.push("/"); // Customer to home/search
        },
    });

    // Register Mutation
    const registerMutation = useMutation({
        mutationFn: registerUser,
        onSuccess: () => {
            router.push("/verify-otp"); // Or login directly if no OTP required immediately
        },
    });

    // Logout Mutation
    const logoutMutation = useMutation({
        mutationFn: logoutUser,
        onSettled: () => {
            localStorage.clear();
            queryClient.clear();
            router.push("/login");
        },
    });

    return {
        user,
        isLoadingUser,
        isAuthenticated: !!user,
        login: loginMutation.mutate,
        isLoggingIn: loginMutation.isPending,
        loginError: loginMutation.error,
        register: registerMutation.mutate,
        isRegistering: registerMutation.isPending,
        registerError: registerMutation.error,
        logout: logoutMutation.mutate,
    };
}
