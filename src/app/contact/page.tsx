
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
          <CardDescription>We'd love to hear from you. Here's how you can reach us.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-accent mt-1" />
                <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-muted-foreground">For general inquiries, please email us at:</p>
                    <a href="mailto:contact@levelupfitness.app" className="text-accent hover:underline">contact@levelupfitness.app</a>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-accent mt-1" />
                <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-muted-foreground">You can reach our support team at:</p>
                    <p>+91 (555) 123-4567</p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-accent mt-1" />
                <div>
                    <h3 className="font-semibold">Office Address</h3>
                    <p className="text-muted-foreground">
                        Level Up Fitness HQ<br/>
                        123 Fitness Avenue<br/>
                        Metropolis, 110001<br/>
                        India
                    </p>
                </div>
            </div>
        </CardContent>
      </Card>
    </main>
  );
}
