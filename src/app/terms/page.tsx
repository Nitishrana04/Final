
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Terms & Conditions</CardTitle>
          <CardDescription>Last updated: October 23, 2025</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <section className="space-y-2">
                <h2 className="text-xl font-semibold">1. Introduction</h2>
                <p className="text-muted-foreground">
                    Welcome to Level Up Fitness ("we," "our," "us"). These Terms & Conditions govern your use of our application and services. By accessing or using our service, you agree to be bound by these terms.
                </p>
            </section>
            <section className="space-y-2">
                <h2 className="text-xl font-semibold">2. User Accounts</h2>
                <p className="text-muted-foreground">
                    When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our service. You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.
                </p>
            </section>
            <section className="space-y-2">
                <h2 className="text-xl font-semibold">3. Subscriptions & Payments</h2>
                <p className="text-muted-foreground">
                    Some parts of the service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle"). Billing cycles are set either on a monthly or annual basis, depending on the type of subscription plan you select when purchasing a Subscription. All payments are handled by a third-party payment processor.
                </p>
            </section>
             <section className="space-y-2">
                <h2 className="text-xl font-semibold">4. Point Redemption</h2>
                <p className="text-muted-foreground">
                   Points earned within the application hold no cash value until a redemption request is submitted and approved by an administrator. We reserve the right to approve or deny redemption requests at our sole discretion, especially in cases of suspected fraud or violation of these terms. The conversion rate of points to cash is subject to change.
                </p>
            </section>
            <section className="space-y-2">
                <h2 className="text-xl font-semibold">5. Termination</h2>
                <p className="text-muted-foreground">
                    We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the service will immediately cease.
                </p>
            </section>
            <section className="space-y-2">
                <h2 className="text-xl font-semibold">6. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                    In no event shall Level Up Fitness, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
                </p>
            </section>
             <section className="space-y-2">
                <h2 className="text-xl font-semibold">7. Contact Us</h2>
                <p className="text-muted-foreground">
                    If you have any questions about these Terms, please contact us at support@levelupfitness.app.
                </p>
            </section>
        </CardContent>
      </Card>
    </main>
  );
}
