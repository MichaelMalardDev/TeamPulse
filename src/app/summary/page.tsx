import TeamSummaryForm from "@/components/ai/team-summary-form";

export default function SummaryPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Team Output Summary
        </h1>
        <p className="text-muted-foreground">
          Generate an AI-powered summary of your remote team's daily output.
        </p>
      </div>
      <TeamSummaryForm />
    </div>
  );
}
