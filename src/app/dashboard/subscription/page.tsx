
'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Gem } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { PaymentDialog } from "@/components/dashboard/payment-dialog";
import type { SubscriptionPlan } from "@/components/dashboard/payment-dialog";
import { useToast } from "@/hooks/use-toast";


const plans: SubscriptionPlan[] = [
    {
        name: "Bronze",
        price: "₹0 / Free",
        priceInr: 0,
        features: [
            "Basic access for new users.",
            "Limited daily quests (2–3).",
            "AI chat (5 messages/day).",
            "Perfect for onboarding users.",
        ],
        cta: "Your Current Plan",
        variant: 'bronze'
    },
    {
        name: "Silver",
        price: "₹199/mo",
        priceInr: 199,
        features: [
            "All Bronze features +",
            "Full workout & diet plan.",
            "10–15 daily quests.",
            "AI chat (unlimited).",
            "Weekly performance insights.",
            "Suitable for consistent users.",
        ],
        cta: "Upgrade to Silver",
        variant: 'silver'
    },
    {
        name: "Gold",
        price: "₹499/mo",
        priceInr: 499,
        features: [
            "All Silver features +",
            "Point redemption (cash rewards) access.",
            "Exclusive weekly challenges.",
            "Priority access to AI coach (fast replies).",
            "Early access to new features.",
            "Great for serious fitness enthusiasts.",
        ],
        cta: "Upgrade to Gold",
        variant: 'gold'
    }
]

export default function SubscriptionPage() {
    const { profile, updateSubscription } = useUser();
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const { toast } = useToast();

    const handleUpgradeClick = (plan: SubscriptionPlan) => {
        setSelectedPlan(plan);
        setIsPaymentDialogOpen(true);
    };

    const handlePaymentSuccess = async (plan: SubscriptionPlan) => {
        if (!profile) return;
        setIsUpgrading(true);
        try {
            await updateSubscription(plan.variant);
            toast({
                title: "Upgrade Successful!",
                description: `You are now on the ${plan.name} Plan.`,
            });
        } catch (error) {
            console.error("Upgrade failed:", error);
            toast({
                variant: 'destructive',
                title: "Upgrade Failed",
                description: "Could not update your subscription. Please try again.",
            });
        } finally {
            setIsUpgrading(false);
            setIsPaymentDialogOpen(false);
        }
    };

    const isCurrentPlan = (planVariant: SubscriptionPlan['variant']) => {
        return profile?.subscription === planVariant;
    }
    
    const isPlanDisabled = (planVariant: SubscriptionPlan['variant']) => {
        if (isCurrentPlan(planVariant)) return true;
        if (profile?.subscription === 'gold' && (planVariant === 'silver' || planVariant === 'bronze')) return true;
        if (profile?.subscription === 'silver' && planVariant === 'bronze') return true;
        return false;
    }

    return (
        <>
            <div className="space-y-8">
                <header>
                    <h1 className="text-4xl font-bold tracking-tighter text-accent">Subscription Plans</h1>
                    <p className="text-muted-foreground mt-2">Unlock more features and maximize your gains by upgrading your plan.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <Card 
                            key={plan.name}
                            className={cn(
                                "flex flex-col",
                                isCurrentPlan(plan.variant) && "border-accent ring-2 ring-accent"
                            )}
                        >
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Gem className={cn(
                                        plan.variant === 'gold' && 'text-yellow-400',
                                        plan.variant === 'silver' && 'text-slate-400',
                                        plan.variant === 'bronze' && 'text-amber-700',
                                    )} />
                                    {plan.name} Plan
                                </CardTitle>
                                <CardDescription className="text-2xl font-bold">{plan.price}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <ul className="space-y-3">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    className="w-full"
                                    disabled={isPlanDisabled(plan.variant)}
                                    onClick={() => handleUpgradeClick(plan)}
                                >
                                    {isCurrentPlan(plan.variant) ? "Your Current Plan" : plan.cta}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
            <PaymentDialog
                isOpen={isPaymentDialogOpen}
                setIsOpen={setIsPaymentDialogOpen}
                plan={selectedPlan}
                onPaymentSuccess={handlePaymentSuccess}
                isProcessing={isUpgrading}
            />
        </>
    )
}
