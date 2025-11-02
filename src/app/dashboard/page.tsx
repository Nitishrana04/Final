
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DailyOverview } from '@/components/dashboard/daily-overview';
import { ProgressTracking } from '@/components/dashboard/progress-tracking';
import { Rewards } from '@/components/dashboard/rewards';
import { AiCoach } from '@/components/dashboard/ai-coach';
import { Community } from '@/components/dashboard/community';
import { Reminders } from '@/components/dashboard/reminders';

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <DashboardHeader />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <DailyOverview />
                    <ProgressTracking />
                    <Community />
                </div>
                <div className="space-y-8">
                    <Rewards />
                    <AiCoach />
                    <Reminders />
                </div>
            </div>
        </div>
    );
}
