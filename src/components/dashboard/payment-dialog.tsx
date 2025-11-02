
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

        if (typeof window === 'undefined') return;

        if (!window.Razorpay) {
            // In development, offer a simulated payment flow for testing.
            if (process.env.NODE_ENV === 'development') {
                toast({
                    title: 'Razorpay not loaded',
                    description: 'Razorpay script not available — simulating payment for development.',
                });
                // Simulate small delay then call success handler
                setTimeout(() => onPaymentSuccess(plan), 800);
                return;
            }

            toast({
                variant: 'destructive',
                title: 'Payment Init Failed',
                description: 'Payment gateway is not available. Try reloading the page.',
            });
            return;
        }

        // Create an order on the server using the secret key and get a real order_id
        const amountInPaise = plan.priceInr * 100;
        let orderId: string | undefined;
        try {
            const receipt = `rcpt_${user?.uid}_${Date.now()}`;
            const res = await fetch('/api/razorpay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: amountInPaise, currency: 'INR', receipt }),
            });
            const data = await res.json();
            if (!res.ok) {
                console.error('Order creation failed', data);
                toast({ variant: 'destructive', title: 'Payment Init Failed', description: data?.error?.details?.error || data?.error || 'Could not create order.' });
                return;
            }
            orderId = data?.order?.id;
        } catch (err) {
            console.error('Failed to create order:', err);
            toast({ variant: 'destructive', title: 'Payment Init Failed', description: 'Could not create payment order. Try again.' });
            return;
        }

        const options = {
            key: RAZORPAY_KEY_ID,
            amount: amountInPaise,
            currency: 'INR',
            name: "Level Up Fitness",
            description: `Upgrade to ${plan.name} Plan`,
            image: `https://picsum.photos/seed/${user?.uid}/100/100`, // Replace with your logo
            // In a real app, you would generate an order_id on your server and pass it here.
            // order_id returned from server
            order_id: orderId,
            handler: function (response: any) {
                // This function is called on a successful payment.
                // In a production app, you should verify the payment signature on your server.
                console.log("Razorpay Response:", response);
                toast({
                    title: 'Payment received',
                    description: 'Verifying payment on server...',
                });

                // Verify signature on server before granting access
                (async () => {
                    try {
                        const verifyResp = await fetch('/api/razorpay/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });
                        const verifyData = await verifyResp.json();
                        if (verifyResp.ok && verifyData?.ok) {
                            toast({ title: 'Payment Verified', description: 'Upgrading your plan...' });
                            onPaymentSuccess(plan);
                        } else {
                            console.error('Payment verification failed', verifyData);
                            toast({ variant: 'destructive', title: 'Verification Failed', description: verifyData?.error || 'Could not verify payment.' });
                        }
                    } catch (err) {
                        console.error('Verification request failed', err);
                        toast({ variant: 'destructive', title: 'Verification Error', description: 'Could not verify payment. Try again.' });
                    }
                })();
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
            // Log full response for debugging
            console.error("Razorpay Payment Failed:", response);

            const err = response?.error || {};
            const message = err.description || err.reason || err.code || 'Something went wrong. Please try again.';

            // Show user-friendly toast
            toast({
                variant: 'destructive',
                title: 'Payment Failed',
                description: message,
            });

            // In development, show a detailed alert to help debugging (do not do this in production)
            if (process.env.NODE_ENV === 'development') {
                try {
                    // stringify safe
                    const details = JSON.stringify(response, Object.getOwnPropertyNames(response));
                    // eslint-disable-next-line no-alert
                    alert(`Payment Failed (debug)\n\n${details}`);
                } catch (e) {
                    // ignore stringify errors
                }
            }
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
