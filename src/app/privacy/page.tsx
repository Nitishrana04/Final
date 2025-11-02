
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
          <CardDescription>Last updated: October 23, 2025</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <section className="space-y-2">
                <h2 className="text-xl font-semibold">1. Information We Collect</h2>
                <p className="text-muted-foreground">
                    We collect several types of information for various purposes to provide and improve our service to you. This includes:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-4">
                    <li><strong>Personal Data:</strong> While using our service, we may ask you to provide us with certain personally identifiable information, such as your email address, username, and fitness goals.</li>
                    <li><strong>Usage Data:</strong> We may collect information on how the service is accessed and used, such as workout completion, diet logs, and points earned.</li>
                    <li><strong>Payment Data:</strong> When you purchase a subscription, our third-party payment processor may collect your payment information. We do not store your full payment card details.</li>
                </ul>
            </section>
            <section className="space-y-2">
                <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
                <p className="text-muted-foreground">
                    Level Up Fitness uses the collected data for various purposes:
                </p>
                 <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-4">
                    <li>To provide and maintain our service.</li>
                    <li>To personalize your experience, including AI-generated plans.</li>
                    <li>To manage your account and subscriptions.</li>
                    <li>To process transactions and redemption requests.</li>
                    <li>To provide customer support and to notify you about changes to our service.</li>
                </ul>
            </section>
            <section className="space-y-2">
                <h2 className="text-xl font-semibold">3. Data Security</h2>
                <p className="text-muted-foreground">
                    The security of your data is important to us. We use commercially acceptable means to protect your Personal Data, such as encryption and secure cloud infrastructure. However, remember that no method of transmission over the Internet or method of electronic storage is 100% secure.
                </p>
            </section>
            <section className="space-y-2">
                <h2 className="text-xl font-semibold">4. Your Rights</h2>
                <p className="text-muted-foreground">
                   You have the right to access, update, or delete the information we have on you. You can do this at any time through your account's profile settings page.
                </p>
            </section>
             <section className="space-y-2">
                <h2 className="text-xl font-semibold">5. Contact Us</h2>
                <p className="text-muted-foreground">
                    If you have any questions about this Privacy Policy, please contact us at privacy@levelupfitness.app.
                </p>
            </section>
        </CardContent>
      </Card>
    </main>
  );
}
