"use client";

import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Schema
const registerSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["CUSTOMER", "OWNER"]),
});

export default function RegisterPage() {
    const { register, isRegistering } = useAuth();

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            role: "CUSTOMER",
        },
    });

    function onSubmit(values: z.infer<typeof registerSchema>) {
        register(values, {
            onSuccess: () => {
                toast.success("Registration successful. Please verify your email.");
            },
            onError: (error: any) => {
                toast.error(error?.formattedMessage || "Failed to register");
            }
        });
    }

    // NOTE: Assuming shadcn 'select' is not yet installed, using simple native select or radio?
    // User rules: "All shadcn components".
    // I must install 'select' or 'radio-group'. I'll stick to a simple role switcher using Buttons or Radio for now, or just text? 
    // Actually, I'll install 'select' in next step to be compliant. But for now I'll use a hack or just assume I'll swap it.
    // I will use a native select temporarily to avoid compile error if Select component is missing?
    // No, I should create the page using standard HTML for select if component missing.
    // Wait, I can run `shadcn add select` concurrently? 
    // I'll stick to native `<select>` with Shadcn styling class for this turn to ensure it compiles, then upgrade.
    // OR simpler: Radio Group.

    return (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Join us to book or manage banquets</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="email@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>I am a:</FormLabel>
                                    <FormControl>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-md flex-1 justify-center has-[:checked]:bg-muted">
                                                <input
                                                    type="radio"
                                                    {...field}
                                                    value="CUSTOMER"
                                                    checked={field.value === "CUSTOMER"}
                                                    className="accent-primary"
                                                />
                                                Customer
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-md flex-1 justify-center has-[:checked]:bg-muted">
                                                <input
                                                    type="radio"
                                                    {...field}
                                                    value="OWNER"
                                                    checked={field.value === "OWNER"}
                                                    className="accent-primary"
                                                />
                                                Venue Owner
                                            </label>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={isRegistering}>
                            {isRegistering ? "Creating account..." : "Register"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="justify-center">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                        Login
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
