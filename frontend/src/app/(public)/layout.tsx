import { Navbar } from "@/components/navbar";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="border-t py-6 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built by Team Banquet. The source code is available on <a href="#" className="font-medium underline underline-offset-4">GitHub</a>.
                    </p>
                </div>
            </footer>
        </div>
    );
}
