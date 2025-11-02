
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';
import { RAZORPAY_KEY_ID } from '@/lib/config';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export type SubscriptionPlan = {
    name: string;
    price: string;
    priceInr: number;
    features: string[];
    cta: string;
    variant: 'bronze' | 'silver' | 'gold' | 'gym-free' | 'gym-prime';
}

interface PaymentDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    plan: SubscriptionPlan | null;
    onPaymentSuccess: (plan: SubscriptionPlan) => void;
    isProcessing: boolean;
}

export function PaymentDialog({ isOpen, setIsOpen, plan, onPaymentSuccess, isProcessing }: PaymentDialogProps) {
    const { toast } = useToast();
    const { user, profile } = useUser();
    
    const handlePayment = async () => {
        if (!plan || !profile) return;

        // In a real app, you'd fetch this from a secure backend endpoint
        const orderDetails = {
            amount: plan.priceInr * 100, // Amount in paise
            currency: "INR",
        };

        const options = {
            key: RAZORPAY_KEY_ID,
            amount: orderDetails.amount,
            currency: orderDetails.currency,
            name: "Level Up Fitness",
            description: `Upgrade to ${plan.name} Plan`,
            image: `https://picsum.photos/seed/${user?.uid}/100/100`, // Replace with your logo
            // In a real app, you would generate an order_id on your server and pass it here.
            // For testing, a placeholder is often sufficient if not creating orders server-side.
            order_id: `order_${Math.random().toString(36).substring(2, 15)}`, 
            handler: function (response: any) {
                // This function is called on a successful payment.
                // In a production app, you should verify the payment signature on your server.
                console.log("Razorpay Response:", response);
                toast({
                    title: 'Payment Successful',
                    description: 'Verifying payment and upgrading your plan...',
                });
                onPaymentSuccess(plan);
            },
            prefill: {
                name: profile.username,
                email: profile.email,
            },
            notes: {
                address: "Level Up Fitness HQ"
            },
            theme: {
                color: "#8A2BE2" // Accent color
            }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', function (response: any) {
            console.error("Razorpay Payment Failed:", response.error);
            toast({
                variant: 'destructive',
                title: 'Payment Failed',
                description: response.error.description || 'Something went wrong. Please try again.',
            });
        });
        
        razorpay.open();
    }
    
    if (!plan) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Upgrade to {plan.name} Plan</DialogTitle>
                    <DialogDescription>
                        You are about to purchase the {plan.name} plan for <span className="font-bold text-foreground">₹{plan.priceInr}</span>.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 text-center">
                    <p className="text-sm text-muted-foreground">You will be redirected to Razorpay to complete your payment securely.</p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isProcessing}>Cancel</Button>
                    <Button onClick={handlePayment} disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="animate-spin" /> : `Proceed to Pay ₹${plan.priceInr}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
