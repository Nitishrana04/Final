
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';

interface WeightEntryDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export function WeightEntryDialog({ isOpen, setIsOpen }: WeightEntryDialogProps) {
    const [weight, setWeight] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    const { logWeight } = useUser();

    const handleSaveWeight = async () => {
        const weightValue = parseFloat(weight);
        if (!weightValue || weightValue <= 0) {
            toast({
                variant: 'destructive',
                title: 'Invalid Weight',
                description: 'Please enter a valid weight in kilograms.',
            });
            return;
        }

        setIsSaving(true);
        try {
            await logWeight(weightValue);
            toast({
                title: 'Weight Logged!',
                description: "Your progress has been updated.",
            });
            setWeight('');
            setIsOpen(false);
        } catch (error) {
            console.error("Error logging weight:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not save your weight. Please try again.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><TrendingUp />Log Your Weight</DialogTitle>
                    <DialogDescription>
                        Great work on the workout! Enter your current weight (in kg) to track your progress.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="weight">Current Weight (kg)</Label>
                        <Input
                            id="weight"
                            type="number"
                            placeholder="e.g., 75.5"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            disabled={isSaving}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>Skip</Button>
                    <Button onClick={handleSaveWeight} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin" /> : 'Save Weight'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
