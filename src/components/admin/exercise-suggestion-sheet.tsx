
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";

interface ExerciseSuggestionSheetProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onSelectExercise: (exerciseString: string) => void;
}

const exerciseLibrary = {
    "Chest": [
        "Bench Press (Flat)",
        "Incline Bench Press",
        "Decline Bench Press",
        "Dumbbell Flyes (Flat/Incline)",
        "Push-Ups",
        "Chest Dips",
        "Cable Crossovers",
        "Machine Chest Press"
    ],
    "Back": [
        "Pull-Ups / Chin-Ups",
        "Lat Pulldown (Wide / Close grip)",
        "Barbell Rows",
        "Dumbbell Rows",
        "Deadlifts",
        "T-Bar Rows",
        "Seated Cable Rows",
        "Hyperextensions (Lower back)"
    ],
    "Shoulders": [
        "Overhead Press (Barbell/Dumbbell)",
        "Arnold Press",
        "Lateral Raises",
        "Front Raises",
        "Rear Delt Flyes",
        "Shrugs (Traps)",
        "Upright Rows"
    ],
    "Biceps": [
        "Barbell Curl",
        "Dumbbell Curl",
        "Hammer Curl",
        "Concentration Curl",
        "Preacher Curl",
        "Cable Curl"
    ],
    "Triceps": [
        "Close Grip Bench Press",
        "Tricep Dips",
        "Tricep Pushdown (Cable)",
        "Overhead Dumbbell Extension",
        "Skull Crushers",
        "Kickbacks"
    ],
    "Legs": [
        "Squats (Barbell / Bodyweight)",
        "Leg Press",
        "Lunges",
        "Leg Extensions",
        "Leg Curls",
        "Romanian Deadlift",
        "Calf Raises"
    ],
    "Abs / Core": [
        "Crunches",
        "Leg Raises",
        "Plank",
        "Bicycle Crunches",
        "Russian Twists",
        "Mountain Climbers",
        "Hanging Leg Raise",
        "Cable Crunch"
    ],
    "Cardio": [
        "Treadmill Running",
        "Cycling",
        "Rowing Machine",
        "Jump Rope",
        "Stair Climber",
        "HIIT (High Intensity Interval Training)"
    ]
};

export function ExerciseSuggestionSheet({ isOpen, setIsOpen, onSelectExercise }: ExerciseSuggestionSheetProps) {
    
    const handleAddExercise = (exerciseName: string) => {
        // Appends a formatted string to the parent component's state
        onSelectExercise(`- ${exerciseName} (3x10) [10pts]\n`);
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Exercise Library</SheetTitle>
                    <SheetDescription>
                        Browse and add exercises to the workout plan. Reps, sets, and points can be edited manually.
                    </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto pr-4">
                     <Accordion type="multiple" className="w-full">
                        {Object.entries(exerciseLibrary).map(([category, exercises]) => (
                            <AccordionItem key={category} value={category}>
                                <AccordionTrigger>{category}</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="space-y-2">
                                        {exercises.map(exercise => (
                                             <li key={exercise} className="flex items-center justify-between p-2 rounded-md hover:bg-accent/10">
                                                <span className="font-medium text-sm">{exercise}</span>
                                                <Button variant="ghost" size="sm" onClick={() => handleAddExercise(exercise)}>
                                                    <PlusCircle size={16} className="mr-2"/>
                                                    Add
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </SheetContent>
        </Sheet>
    );
}
