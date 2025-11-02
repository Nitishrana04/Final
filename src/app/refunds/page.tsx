
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RefundsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Refunds & Cancellation Policy</CardTitle>
          <CardDescription>Last updated: October 23, 2025</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <section className="space-y-2">
                <h2 className="text-xl font-semibold">1. Overview</h2>
                <p className="text-muted-foreground">
                    Our policy for refunds and cancellations applies to all digital subscription plans offered through the Level Up Fitness application. Due to the digital nature of our services, our refund policy is limited.
                </p>
            </section>
            <section className="space-y-2">
                <h2 className="text-xl font-semibold">2. Subscription Cancellation</h2>
                <p className="text-muted-foreground">
                    You can cancel your subscription at any time from your Profile page. When you cancel, your subscription will remain active until the end of the current billing cycle. You will not be charged for the next cycle. No partial refunds are provided for the remaining period of the current cycle.
                </p>
            </section>
            <section className="space-y-2">
                <h2 className="text-xl font-semibold">3. Refund Eligibility</h2>
                <p className="text-muted-foreground">
                    We offer a 3-day money-back guarantee for new subscription purchases. If you are unsatisfied with our service for any reason, you may request a full refund within 3 calendar days of your initial purchase.
                </p>
                <p className="text-muted-foreground">
                    Refunds are not available for subscription renewals.
                </p>
            </section>
            <section className="space-y-2">
                <h2 className="text-xl font-semibold">4. How to Request a Refund</h2>
                <p className="text-muted-foreground">
                    To request a refund within the 3-day eligibility period, please contact our support team at <a href="mailto:refunds@levelupfitness.app" className="text-accent hover:underline">refunds@levelupfitness.app</a> with your account details and the reason for your request. Refunds are processed within 5-7 business days.
                </p>
            </section>
            <section className="space-y-2">
                <h2 className="text-xl font-semibold">5. Points Redemption</h2>
                <p className="text-muted-foreground">
                    Cash redeemed via the Points system is non-refundable. Once a redemption request is approved and the transfer is made, it cannot be reversed.
                </p>
            </section>
        </CardContent>
      </Card>
    </main>
  );
}
