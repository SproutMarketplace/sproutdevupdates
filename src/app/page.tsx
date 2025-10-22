
import Image from 'next/image';
import { EmailFormWrapper } from '@/components/email-form-wrapper';
import { Leaf, Users, HeartHandshake, Instagram, Twitter, CheckCircle, Facebook } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-body" suppressHydrationWarning>
            <header className="px-4 sm:px-6 lg:px-8 flex justify-center py-4 bg-muted border-b border-border z-10" suppressHydrationWarning>
                <Image
                    src="/sprout.png"
                    alt="Sprout Logo"
                    width={120}
                    height={32}
                    priority
                    className="-my-2"
                    data-ai-hint="company logo"
                />
            </header>

            <main className="w-full flex-1 flex flex-col" suppressHydrationWarning>
                <section className="relative overflow-hidden" suppressHydrationWarning>
                    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 z-10" suppressHydrationWarning>
                        <div className="grid md:grid-cols-2 gap-12 items-center" suppressHydrationWarning>
                            {/* Left Column: Explainer */}
                            <div className="space-y-6 pr-8" suppressHydrationWarning>
                                <h1 className="font-headline text-4xl sm:text-5xl font-bold text-primary tracking-tight animate-fade-in-down">
                                    The Marketplace is About to Sprout.
                                </h1>
                                <p className="text-lg sm:text-xl text-muted-foreground animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
                                    Be an early bird! The first <strong>100 users</strong> get <strong>1 month of the elite plan</strong>, and one lucky winner from that group will receive a rare <strong>Hulk x Goliath Trichocereus Cacti Tip!</strong>
                                </p>
                                <p className="text-lg sm:text-xl text-muted-foreground animate-fade-in-down" style={{ animationDelay: '0.3s' }}>
                                    Sign up for launch updates and secure your spot for the future of plant and fungi marketplaces!
                                </p>
                                <div className="space-y-4 text-muted-foreground animate-fade-in-down" style={{ animationDelay: '0.4s' }} suppressHydrationWarning>
                                    <div className="flex items-start gap-3" suppressHydrationWarning>
                                        <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                                        <p><strong>For Sellers:</strong> Reach a dedicated audience of enthusiasts, manage your inventory with powerful tools, and benefit from our secure and streamlined trading process.</p>
                                    </div>
                                    <div className="flex items-start gap-3" suppressHydrationWarning>
                                        <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                                        <p><strong>For Buyers:</strong> Discover rare and unique species you won't find anywhere else. Connect with trusted sellers and grow your collection and skills with confidence.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Signup Form */}
                            <div className="relative" suppressHydrationWarning>
                                <div className="relative w-full bg-muted p-8 sm:p-10 md:p-12 rounded-xl shadow-2xl border border-border z-10" suppressHydrationWarning>
                                    <EmailFormWrapper />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="w-full bg-background py-20 sm:py-24 z-10" suppressHydrationWarning>
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
                        <h2 className="text-3xl sm:text-4xl font-bold text-center text-primary font-headline mb-12">
                            A Growing Marketplace for Plant & Fungi Lovers
                        </h2>
                        <div className="grid md:grid-cols-3 gap-10 text-center" suppressHydrationWarning>
                            <div className="flex flex-col items-center p-6 bg-card/50 rounded-lg border border-border/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/20 animate-fade-in-up" suppressHydrationWarning>
                                <div className="bg-primary/10 p-5 rounded-full mb-5 border border-primary/20">
                                    <Leaf className="w-10 h-10 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 font-headline text-primary/90">Discover & Trade</h3>
                                <p className="text-muted-foreground">
                                    Explore a vast, user-powered marketplace to find rare and unique plants & fungi. Securely trade your own cuttings, plants, fungi, and supplies with others.
                                </p>
                            </div>
                            <div className="flex flex-col items-center p-6 bg-card/50 rounded-lg border border-border/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/20 animate-fade-in-up" style={{ animationDelay: '0.2s' }} suppressHydrationWarning>
                                <div className="bg-primary/10 p-5 rounded-full mb-5 border border-primary/20">
                                    <Users className="w-10 h-10 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 font-headline text-primary/90">Build Community</h3>
                                <p className="text-muted-foreground">
                                    Connect with a vibrant community of plant & fungi enthusiasts. Follow other traders, share tips, and grow your network of green-thumbed friends.
                                </p>
                            </div>
                            <div className="flex flex-col items-center p-6 bg-card/50 rounded-lg border border-border/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-primary/20 animate-fade-in-up" style={{ animationDelay: '0.4s' }} suppressHydrationWarning>
                                <div className="bg-primary/10 p-5 rounded-full mb-5 border border-primary/20">
                                    <HeartHandshake className="w-10 h-10 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2 font-headline text-primary/90">Manage Your Collection</h3>
                                <p className="text-muted-foreground">
                                    Digitally catalog your plant & fungi collections, track your trade history, and maintain a wishlist for plants and fungi you're searching for.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="w-full bg-muted py-6 px-4 sm:px-6 lg:px-8 border-t border-border mt-auto z-10" suppressHydrationWarning>
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-6" suppressHydrationWarning>
                    <div className="flex items-center gap-4" suppressHydrationWarning>
                        <Image
                            src="/sprout.png"
                            alt="Sprout Logo"
                            width={120}
                            height={32}
                            className="h-8 w-auto"
                            data-ai-hint="company logo"
                        />
                        <p className="text-sm text-muted-foreground">
                            &copy; 2025 Sprout Marketplace, LLC. All rights reserved.
                        </p>
                    </div>
                    <div className="flex items-center gap-4" suppressHydrationWarning>
                        <Link href="https://www.instagram.com/sprout.marketplace/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <Instagram className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
                        </Link>
                        <Link href="https://x.com/SproutMarketApp" target="_blank" rel="noopener noreferrer" aria-label="X formerly known as Twitter">
                            <svg className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.6.75Zm-1.7 12.95h1.5l-8.75-11.5H2.45l8.45 11.5Z"/>
                            </svg>
                        </Link>
                        <Link href="https://www.facebook.com/groups/762496292993718" target="_blank" rel="noopener noreferrer" aria-label="Facebook Group">
                            <Facebook className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
