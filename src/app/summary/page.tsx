import MeetingScheduler from "@/components/ai/meeting-scheduler";

export default function SummaryPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          AI Meeting Scheduler
        </h1>
        <p className="text-muted-foreground">
          Let AI find the best day for your next team gathering based on presence data.
        </p>
      </div>
      <MeetingScheduler />
    </div>
  );
}
