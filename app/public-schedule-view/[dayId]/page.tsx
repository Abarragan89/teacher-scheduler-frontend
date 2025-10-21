import { serverDays } from "@/lib/api/services/days/server";
import { formatDateDisplay } from "@/lib/utils";
import { DayData } from "@/types/day";
import PublicViewAccordion from "../public-view-accordion";

interface PublicScheduleViewProps {
    params: Promise<{
        dayId: string
    }>
}

export default async function PublicScheduleView({ params }: PublicScheduleViewProps) {

    const { dayId } = await params;

    const currentDay: DayData = await serverDays.findSingleDay(dayId);

    console.log("currentDay  in public", currentDay)



    // if (loading) {
    //     return (
    //         <div className="max-w-4xl mx-auto p-6">
    //             <div className="animate-pulse space-y-4">
    //                 <div className="h-8 bg-muted rounded w-1/3"></div>
    //                 <div className="space-y-3">
    //                     {[1, 2, 3].map(i => (
    //                         <div key={i} className="h-24 bg-muted rounded"></div>
    //                     ))}
    //                 </div>
    //             </div>
    //         </div>
    //     )
    // }

    // if (!scheduleData) {
    //     return (
    //         <div className="max-w-4xl mx-auto p-6">
    //             <div className="text-center py-12">
    //                 <h2 className="text-2xl font-semibold text-muted-foreground">
    //                     Schedule not found
    //                 </h2>
    //                 <p className="text-muted-foreground mt-2">
    //                     The requested schedule could not be loaded.
    //                 </p>
    //             </div>
    //         </div>
    //     )
    // }

    // Filter out tasks with no content
    // const activeTasks = scheduleData.tasks.filter(task =>
    //     task.title.trim() !== '' ||
    //     task.outlineItems.some(item => item.text.trim() !== '')
    // )

    return (
        <div className="max-w-4xl mx-auto p-6 py-10">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Daily Lesson Plan</h1>
                <p className="text-muted-foreground">
                    {formatDateDisplay(new Date(currentDay.dayDate.replace(/-/g, "/")))}
                </p>
            </div>

            <PublicViewAccordion
                schedule={currentDay?.schedule}
            />



            {/* {activeTasks.length === 0 && (
                <div className="text-center py-12">
                    <h2 className="text-2xl font-semibold text-muted-foreground">
                        No tasks scheduled
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        This schedule appears to be empty.
                    </p>
                </div>
            )} */}
        </div>
    )
}
