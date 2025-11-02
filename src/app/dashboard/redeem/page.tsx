
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { Coins, Gift, Gem, Loader2, Lock, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';

const MINIMUM_REDEEM_POINTS = 5000;
const CONVERSION_RATE = 100; // 100 points = 1 Rupee

export default function RedeemPage() {
    const { profile, loading, redeemPoints } = useUser();
    const { toast } = useToast();
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [redeemAmount, setRedeemAmount] = useState('');
    const [upiId, setUpiId] = useState('');

    const userPoints = profile?.points ?? 0;
    const isGoldMember = profile?.subscription === 'gold';
    const canRedeem = userPoints >= MINIMUM_REDEEM_POINTS && isGoldMember;
    const rupeesEquivalent = (userPoints / CONVERSION_RATE).toFixed(2);
    
    const redeemAmountInRupees = useMemo(() => {
        const amount = parseInt(redeemAmount);
        return isNaN(amount) ? 0 : amount / CONVERSION_RATE;
    }, [redeemAmount]);

    const handleRedeem = async () => {
        if (!isGoldMember) {
             toast({
                variant: 'destructive',
                title: 'Upgrade Required',
                description: 'Point redemption is only available for Gold Plan members.'
            });
            return;
        }

        const amount = parseInt(redeemAmount);
        if (!upiId.trim() || !amount || amount <= 0) {
            toast({
                variant: 'destructive',
                title: 'Invalid Input',
                description: 'Please enter a valid UPI ID and amount.'
            });
            return;
        }

        if (amount > userPoints) {
            toast({
                variant: 'destructive',
                title: 'Not enough points!',
                description: `You don't have enough points to redeem that amount.`
            });
            return;
        }
        
        if (amount < MINIMUM_REDEEM_POINTS) {
             toast({
                variant: 'destructive',
                title: 'Minimum Redemption',
                description: `You must redeem at least ${MINIMUM_REDEEM_POINTS.toLocaleString()} points at a time.`
            });
            return;
        }

        setIsRedeeming(true);

        try {
            await redeemPoints(amount, upiId);
            toast({
                title: 'Request Submitted!',
                description: `Your redemption request for ${amount.toLocaleString()} points has been sent for approval.`
            });
            setRedeemAmount('');
            setUpiId('');
        } catch (error) {
             let errorMessage = "An error occurred while submitting your request.";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast({
                variant: 'destructive',
                title: 'Request Failed',
                description: errorMessage,
            });
        } finally {
             setIsRedeeming(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter text-accent">Redeem Points</h1>
                    <p className="text-muted-foreground mt-2">Convert your hard-earned points into cash.</p>
                </div>
                 <div className="flex items-center gap-2 p-3 bg-card border rounded-lg text-lg">
                    <Coins className="h-6 w-6 text-yellow-400" />
                    <span className="font-bold">{userPoints.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">Points Balance</span>
                </div>
            </header>

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {!isGoldMember && <Lock className="text-yellow-400" />}
                        Redeem for Cash
                    </CardTitle>
                    <CardDescription>Convert your points to real money via UPI transfer. This feature is exclusive to Gold members.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 rounded-lg bg-muted text-center">
                        <p className="text-sm font-bold text-muted-foreground">CONVERSION RATE</p>
                        <p className="text-2xl font-bold">{CONVERSION_RATE.toLocaleString()} Points = ₹1</p>
                         <p className="text-lg text-green-400 font-semibold mt-2">Your balance is worth: ₹{rupeesEquivalent}</p>
                    </div>
                    
                    {!isGoldMember && (
                         <Alert variant="destructive" className="border-yellow-400/50 text-yellow-400 [&>svg]:text-yellow-400">
                            <Gem className="h-4 w-4" />
                            <AlertTitle>Gold Plan Required</AlertTitle>
                            <AlertDescription>
                                You must be a Gold Plan member to redeem points. Upgrade your plan to unlock this feature and start earning cash from your points.
                                <Button variant="link" asChild className="p-0 h-auto ml-1 text-yellow-400">
                                    <Link href="/dashboard/subscription">Upgrade Now</Link>
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

                    {!canRedeem && isGoldMember && (
                         <Alert variant="destructive">
                            <ShieldAlert className="h-4 w-4" />
                            <AlertTitle>Not Eligible for Redemption</AlertTitle>
                            <AlertDescription>
                                You need at least <strong className="text-destructive-foreground">{MINIMUM_REDEEM_POINTS.toLocaleString()} points</strong> to start redeeming. Keep up the grind!
                            </AlertDescription>
                        </Alert>
                    )}
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="upi-id">Your UPI ID</Label>
                            <Input 
                                id="upi-id"
                                placeholder="yourname@bank"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                disabled={!isGoldMember || isRedeeming}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="redeem-amount">Points to Redeem</Label>
                            <Input 
                                id="redeem-amount" 
                                type="number" 
                                placeholder={`e.g., ${MINIMUM_REDEEM_POINTS}`}
                                value={redeemAmount}
                                onChange={(e) => setRedeemAmount(e.target.value)}
                                disabled={!isGoldMember || isRedeeming}
                            />
                            {redeemAmountInRupees > 0 && (
                                 <p className="text-sm text-muted-foreground text-right">You will get: <span className="font-bold text-green-400">₹{redeemAmountInRupees.toLocaleString()}</span></p>
                            )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button 
                        className="w-full"
                        disabled={!canRedeem || isRedeeming}
                        onClick={handleRedeem}
                    >
                         {isRedeeming ? <Loader2 className="animate-spin" /> : "Submit Redemption Request"}
                    </Button>
                </CardFooter>
            </Card>

        </div>
    )
}
