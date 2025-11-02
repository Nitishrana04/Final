
'use client';

import * as React from 'react';
import { useState } from 'react';
import type { DayProps } from 'react-day-picker';
import { useDayRender } from 'react-day-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dumbbell, Utensils, Sparkles, Loader2, Salad, CheckCircle2, Lock, BookMarked } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Calendar } from '../ui/calendar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { generatePlan } from '@/ai/flows/planner';
import { ExerciseSuggestionSheet } from './exercise-suggestion-sheet';


type User = {
  uid: string;
  username: string;
  email: string;
  goal: string;
  level: number;
};

interface GeneratePlanDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    user: User | null;
    isPrime?: boolean;
}

// Mock data for assigned plans - in a real app, this would be fetched
const assignedPlans: Record<string, { workout?: boolean; diet?: boolean }> = {
    "2024-07-22": { workout: true, diet: true },
    "2024-07-24": { workout: true },
    "2024-08-01": { diet: true },
};

const assignedPlanDates = Object.keys(assignedPlans).map(dateStr => new Date(dateStr));

function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function GeneratePlanDialog({ isOpen, setIsOpen, user, isPrime = true }: GeneratePlanDialogProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [workoutPlan, setWorkoutPlan] = useState('');
    const [dietPlan, setDietPlan] = useState('');
    const [dietType, setDietType] = useState<'veg' | 'non-veg'>('veg');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const { toast } = useToast();
    const [isSuggestionSheetOpen, setIsSuggestionSheetOpen] = useState(false);

    const handleGenerateWorkout = async () => {
        if (!user || !isPrime) return;
        setIsGenerating(true);
        try {
            const result = await generatePlan({
                planType: 'workout',
                user: {
                    goal: user.goal,
                    level: user.level,
                }
            });
            setWorkoutPlan(result.plan);
        } catch (error) {
            console.error("Error generating workout plan:", error);
            toast({
                variant: 'destructive',
                title: 'AI Generation Failed',
                description: 'Could not generate workout plan.'
            });
        } finally {
            setIsGenerating(false);
        }
    }
    
    const handleGenerateDiet = async () => {
        if (!user || !isPrime) return;
        setIsGenerating(true);
         try {
            const result = await generatePlan({
                planType: 'diet',
                user: {
                    goal: user.goal,
                    level: user.level,
                },
                dietPreference: dietType,
            });
            setDietPlan(result.plan);
        } catch (error) {
            console.error("Error generating diet plan:", error);
            toast({
                variant: 'destructive',
                title: 'AI Generation Failed',
                description: 'Could not generate diet plan.'
            });
        } finally {
            setIsGenerating(false);
        }
    }
    
    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setWorkoutPlan('');
            setDietPlan('');
            setSelectedDate(new Date());
        }
        setIsOpen(open);
    }
    
    const handleAssignPlan = async () => {
        if (!user || !selectedDate || (!workoutPlan && !dietPlan)) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'User, date, and at least one plan must be set.',
            });
            return;
        }

        setIsAssigning(true);
        try {
            const planId = formatDate(selectedDate);
            const planDocRef = doc(db, `users/${user.uid}/plans`, planId);

            await setDoc(planDocRef, {
                date: Timestamp.fromDate(selectedDate),
                workoutPlan: workoutPlan || null,
                dietPlan: dietPlan || null
            }, { merge: true });

            toast({
                title: 'Plan Assigned!',
                description: `${user.username}'s plan for ${selectedDate.toLocaleDateString()} has been saved.`,
            });
            handleOpenChange(false);
        } catch (error) {
            console.error('Error assigning plan:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to assign the plan. Please try again.',
            });
        } finally {
            setIsAssigning(false);
        }
    }

    const handleSelectExercise = (exerciseString: string) => {
        setWorkoutPlan(prev => prev ? `${prev}${exerciseString}` : exerciseString);
    }
    
    function CustomDay(props: DayProps) {
        const buttonRef = React.useRef<HTMLButtonElement>(null);
        const dayRender = useDayRender(props.date, props.displayMonth, buttonRef);
        
        const dateStr = props.date.toISOString().split('T')[0];
        const plan = assignedPlans[dateStr];
        
        if ((dayRender as any).isOutside) {
            return <div {...dayRender.divProps} />;
        }

        if (plan) {
            const tooltipContent = [
                plan.workout && 'Workout Assigned',
                plan.diet && 'Diet Assigned'
            ].filter(Boolean).join(' & ');

            return (
                 <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <button
                                ref={buttonRef}
                                {...dayRender.buttonProps}
                                className={cn(
                                    dayRender.buttonProps.className,
                                    "relative"
                                )}
                             >
                                <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                {props.date.getDate()}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="flex items-center gap-2"><CheckCircle2 size={14}/> {tooltipContent}</p>
                        </TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
            );
        }

        return <button ref={buttonRef} {...dayRender.buttonProps} />;
    }

    const aiButton = (onClick: () => void) => (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                     <div className="w-full">
                        <Button onClick={onClick} disabled={isGenerating || !isPrime} className="w-full">
                            {isGenerating ? <Loader2 className="animate-spin"/> : !isPrime ? <Lock className="mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Generate with AI
                        </Button>
                     </div>
                </TooltipTrigger>
                {!isPrime && (
                    <TooltipContent>
                        <p>Upgrade to Prime to use AI generation.</p>
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    );


    return (
        <>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-4xl grid-cols-1 md:grid-cols-3">
                <div className="md:col-span-1 p-4 flex flex-col items-center">
                    <h4 className="font-semibold mb-4">Plan Schedule</h4>
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                        modifiers={{ assigned: assignedPlanDates }}
                        modifiersStyles={{
                             assigned: {
                                backgroundColor: 'hsl(var(--destructive) / 0.2)',
                                color: 'hsl(var(--destructive-foreground))',
                            }
                        }}
                        components={{
                            Day: CustomDay
                        }}
                    />
                     <div className="mt-4 text-xs text-muted-foreground space-y-2 text-center">
                        <p className="flex items-center gap-2"><span className="h-4 w-4 rounded-full bg-destructive/20 block border border-destructive"></span> Date with assigned plan.</p>
                        <p>Select a date to generate a new plan.</p>
                    </div>
                </div>
                <div className="md:col-span-2">
                    <DialogHeader>
                        <DialogTitle>Assign Plan for {user?.username}</DialogTitle>
                        <DialogDescription>
                            Create a workout and/or diet plan for the selected date. Use AI for faster generation (Prime feature).
                        </DialogDescription>
                    </DialogHeader>
                    
                    <Tabs defaultValue="workout" className="w-full mt-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="workout"><Dumbbell className="mr-2 h-4 w-4" />Workout</TabsTrigger>
                            <TabsTrigger value="diet"><Utensils className="mr-2 h-4 w-4" />Diet</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="workout" className="mt-4 space-y-4">
                            <div className="p-4 border rounded-lg space-y-2">
                                <h4 className="font-semibold">User Details</h4>
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">Goal:</span> {user?.goal} | <span className="font-medium text-foreground">Level:</span> {user?.level}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {aiButton(handleGenerateWorkout)}
                                <Button variant="outline" onClick={() => setIsSuggestionSheetOpen(true)}>
                                    <BookMarked className="mr-2 h-4 w-4" />
                                    Browse Exercises
                                </Button>
                            </div>
                            <Textarea 
                                placeholder="Manually type workout plan here... e.g.,- Bench Press (3x10) [15pts]... or browse exercises"
                                value={workoutPlan}
                                onChange={(e) => setWorkoutPlan(e.target.value)}
                                rows={8}
                                className="text-sm"
                            />
                        </TabsContent>
                        
                        <TabsContent value="diet" className="mt-4 space-y-4">
                            <div className="p-4 border rounded-lg space-y-4">
                                <h4 className="font-semibold">Dietary Preference</h4>
                                <RadioGroup defaultValue="veg" value={dietType} onValueChange={(value) => setDietType(value as 'veg' | 'non-veg')}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="veg" id="veg" />
                                        <Label htmlFor="veg" className="flex items-center gap-2"><Salad />Vegetarian</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="non-veg" id="non-veg" />
                                        <Label htmlFor="non-veg" className="flex items-center gap-2"><Dumbbell />Non-Vegetarian</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            {aiButton(handleGenerateDiet)}
                            <Textarea 
                                placeholder="Manually type diet plan here... e.g., Breakfast: Oats..."
                                value={dietPlan}
                                onChange={(e) => setDietPlan(e.target.value)}
                                rows={8}
                                className="text-sm"
                            />
                        </TabsContent>
                    </Tabs>
                    
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
                        <Button onClick={handleAssignPlan} disabled={isAssigning || !selectedDate || (!workoutPlan && !dietPlan)}>
                            {isAssigning ? <Loader2 className="animate-spin"/> : 'Assign Plan'}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
        <ExerciseSuggestionSheet 
            isOpen={isSuggestionSheetOpen}
            setIsOpen={setIsSuggestionSheetOpen}
            onSelectExercise={handleSelectExercise}
        />
        </>
    );
}
