import { CopilotChat } from "@/components/kaushal/copilot-chat";
import { PageHeader } from "@/components/kaushal/page-header";
import { suggestedQuestions } from "@/lib/ai/copilot";
import { resolvedAiProvider } from "@/lib/env";
import { currentStudentId } from "@/lib/guards";

export default async function CopilotPage() {
  await currentStudentId();
  const provider = resolvedAiProvider();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Career Copilot"
        description={`Context-aware, grounded in your profile. Not a general chatbot. Active AI provider: ${provider.toUpperCase()}${provider === "mock" ? " (deterministic; set GEMINI_API_KEY to switch)" : ""}.`}
      />
      <CopilotChat suggestions={suggestedQuestions()} />
      <p className="text-muted-foreground text-xs">
        The copilot never sets your readiness, gaps or match scores — those come
        from deterministic engines. It only turns that output into a readable
        answer, and (with Gemini configured) into more fluent phrasing.
      </p>
    </div>
  );
}
