
'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Gem, Sparkles } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { PaymentDialog } from "@/components/dashboard/payment-dialog";
import type { SubscriptionPlan } from "@/components/dashboard/payment-dialog";
import { useToast } from "@/hooks/use-toast";

const plans: SubscriptionPlan[] = [
    {
        name: "Free",
        price: "₹0 / Free",
        priceInr: 0,
        features: [
            "Manage your gym profile.",
            "View member list and basic stats.",
            "Send bulk notifications to members.",
            "Leaderboard access for your gym.",
        ],
        cta: "Your Current Plan",
        variant: 'gym-free'
    },
    {
        name: "Prime",
        price: "₹999/mo",
        priceInr: 999,
        features: [
            "All Free features +",
            "AI-Powered Plan Generation for members.",
            "Create custom workout and diet plans.",
            "Provide personalized coaching.",
            "Priority support.",
        ],
        cta: "Upgrade to Prime",
        variant: 'gym-prime'
    }
]

export default function GymOwnerSubscriptionPage() {
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

    return (
        <>
            <div className="space-y-8">
                <header>
                    <h1 className="text-4xl font-bold tracking-tighter text-accent">Gym Subscription Plans</h1>
                    <p className="text-muted-foreground mt-2">Unlock powerful AI tools to coach your members.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
                                     {plan.variant === 'gym-prime' ? 
                                        <Sparkles className="text-yellow-400" /> :
                                        <Gem className="text-amber-700" />
                                    }
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
                                    disabled={isCurrentPlan(plan.variant)}
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
