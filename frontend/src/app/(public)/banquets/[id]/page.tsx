"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Users, Star, IndianRupee, Heart, Share2, Check } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Mock individual fetch
async function fetchBanquetById(id: string) {
    // const { data } = await api.get(`/banquets/${id}`);
    // return data.data;

    // Mock
    return {
        _id: id,
        name: "Grand Palace Hotel",
        description: "A luxurious venue perfect for weddings and corporate events. Features state-of-the-art facilities and exceptional service.",
        address: "123 Main St",
        city: "Mumbai",
        capacity: 500,
        pricePerPlate: 1200,
        rating: 4.8,
        reviewsCount: 124,
        amenities: ["AC", "Parking", "Catering", "Decor", "Wifi", "Bridal Room"],
        images: [
            "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1519225421980-715cb0202128?q=80&w=2098&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop"
        ],
        owner: {
            name: "Luxury Hotels Group"
        }
    };
}

export default function BanquetDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { data: banquet, isLoading } = useQuery({
        queryKey: ["banquet", params.id],
        queryFn: () => fetchBanquetById(params.id as string),
    });

    const [date, setDate] = useState<Date | undefined>(new Date());

    if (isLoading) {
        return <div className="container py-10">Loading...</div>; // Replace with Skeleton
    }

    if (!banquet) {
        return <div className="container py-10">Banquet not found</div>;
    }

    const handleBookClick = () => {
        if (!isAuthenticated) {
            toast.error("Please login to book this venue");
            router.push(`/login?redirect=/banquets/${params.id}`);
            return;
        }
        // Open booking dialog is handled by DialogTrigger
    };

    return (
        <div className="container py-6 px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Images & Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header */}
                    <div>
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold">{banquet.name}</h1>
                                <div className="flex items-center text-muted-foreground mt-2">
                                    <MapPin className="mr-1 h-4 w-4" />
                                    {banquet.address}, {banquet.city}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon">
                                    <Share2 className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon">
                                    <Heart className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                            <Badge variant="secondary" className="px-3 py-1">
                                <Star className="h-3 w-3 mr-1 fill-primary text-primary" />
                                {banquet.rating} ({banquet.reviewsCount} reviews)
                            </Badge>
                            <span className="flex items-center text-sm text-muted-foreground">
                                <Users className="h-4 w-4 mr-1" />
                                {banquet.capacity} Guests
                            </span>
                        </div>
                    </div>

                    {/* Image Carousel */}
                    <Carousel className="w-full">
                        <CarouselContent>
                            {banquet.images.map((img: string, index: number) => (
                                <CarouselItem key={index}>
                                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                                        <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                    </Carousel>

                    {/* About */}
                    <section>
                        <h2 className="text-xl font-semibold mb-3">About this Venue</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            {banquet.description}
                        </p>
                    </section>

                    <Separator />

                    {/* Amenities */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {banquet.amenities.map((amenity: string) => (
                                <div key={amenity} className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-primary" />
                                    <span>{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Booking Card */}
                <div className="space-y-6">
                    <Card className="sticky top-24 shadow-lg border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-end gap-1">
                                <span className="text-3xl font-bold">₹{banquet.pricePerPlate}</span>
                                <span className="text-sm font-normal text-muted-foreground mb-1">/ plate</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="border rounded-md p-4">
                                <span className="text-xs font-medium uppercase text-muted-foreground mb-2 block">Select Name</span>
                                {/* Date Picker Logic Placeholder */}
                                <div className="text-sm font-medium">
                                    Contact owner for availability
                                </div>
                            </div>

                            {/* Booking Dialog */}
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="w-full" size="lg" onClick={handleBookClick}>
                                        Request Booking
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Book {banquet.name}</DialogTitle>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            className="rounded-md border mx-auto"
                                        />
                                        <div className="mt-4 text-center text-sm text-muted-foreground">
                                            This is a demo. Backend integration required to check real slots.
                                        </div>
                                    </div>
                                    <Button className="w-full">Confirm Request</Button>
                                </DialogContent>
                            </Dialog>

                            <p className="text-xs text-center text-muted-foreground">
                                You won't be charged yet
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
