
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageCheck, Zap } from "lucide-react";

export default function ServiceDeliveryPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Service Delivery Policy</CardTitle>
          <CardDescription>How we deliver our digital services to you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <section className="space-y-2">
                <h2 className="text-xl font-semibold flex items-center gap-2"><PackageCheck /> Digital Product Delivery</h2>
                <p className="text-muted-foreground">
                    Level Up Fitness is a digital application, and all our products and services are delivered electronically. There are no physical goods to be shipped.
                </p>
            </section>
            <section className="space-y-2">
                <h2 className="text-xl font-semibold flex items-center gap-2"><Zap /> Instant Activation</h2>
                <p className="text-muted-foreground">
                    Upon successful payment and confirmation for a subscription plan (e.g., Silver or Gold), your new features and benefits will be activated on your account instantly. You should see the changes reflected in your dashboard immediately after payment.
                </p>
            </section>
             <section className="space-y-2">
                <h2 className="text-xl font-semibold">Confirmation of Service</h2>
                <p className="text-muted-foreground">
                   You will receive an email confirmation to the address associated with your account upon successful purchase of a subscription. This email will serve as your receipt and confirmation of service activation. Your updated subscription status will also be visible on your Profile page.
                </p>
            </section>
             <section className="space-y-2">
                <h2 className="text-xl font-semibold">Questions?</h2>
                <p className="text-muted-foreground">
                    If you experience any issues with your subscription not activating after a successful payment, please contact our support team immediately at <a href="mailto:support@levelupfitness.app" className="text-accent hover:underline">support@levelupfitness.app</a> with your transaction details.
                </p>
            </section>
        </CardContent>
      </Card>
    </main>
  );
}
