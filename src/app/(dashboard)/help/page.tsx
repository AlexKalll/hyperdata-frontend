"use client";

import AuthenticatedPage from "@/app/components/layout/AuthenticatedPage";
import { useSession } from "next-auth/react";
import { CheckCircle2, Mail, Phone } from "lucide-react";

type SupportRole = "ProjectManager" | "Facilitator" | "Reviewer";

const roleGuides: Record<
  SupportRole,
  { roleName: string; steps: { title: string; description: string }[] }
> = {
  ProjectManager: {
    roleName: "Project Manager",
    steps: [
      {
        title: "Open your projects",
        description: "Choose a project assigned to you from Projects.",
      },
      {
        title: "Manage its tasks",
        description:
          "Open a task to check its instructions, users assigned, and submitted work.",
      },
      {
        title: "Track progress",
        description:
          "Use the project and task summaries to spot delays or items needing attention.",
      },
    ],
  },
  Facilitator: {
    roleName: "Facilitator",
    steps: [
      {
        title: "Open your assigned tasks",
        description: "Choose a task from Tasks and read its instructions.",
      },
      {
        title: "Support contributors",
        description:
          "Help contributors understand the task and follow its instructions.",
      },
      {
        title: "Raise blockers early",
        description:
          "Let your project manager know if a task is unclear or cannot progress.",
      },
    ],
  },
  Reviewer: {
    roleName: "Reviewer",
    steps: [
      {
        title: "Open your assigned tasks",
        description: "Choose a task from Tasks and read its review instructions.",
      },
      {
        title: "Review each submission",
        description:
          "Check the submitted work against the task requirements.",
      },
      {
        title: "Submit your decision",
        description:
          "Approve acceptable work or explain clearly what needs to be corrected.",
      },
    ],
  },
};

export default function HelpSupportPage() {
  const { data: session } = useSession();
  const role = session?.user?.role as SupportRole | undefined;
  const guide = role ? roleGuides[role] : undefined;

  return (
    <AuthenticatedPage loadingMessage="Loading help and support...">
      {guide ? (
        <main className="mx-auto max-w-3xl space-y-6 p-2 sm:p-4">
          <header>
            <p className="text-sm font-medium text-primary">{guide.roleName}</p>
            <h1 className="mt-1 text-2xl font-semibold text-gray-900">
              Help &amp; Support
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Follow these quick steps to get started. Contact support if you
              need help or encounter a problem.
            </p>
          </header>

          <section
            aria-label={`${guide.roleName} steps`}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <ol className="space-y-5">
              {guide.steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="font-medium text-gray-900">{step.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 aria-hidden="true" className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-gray-900">Need help?</h2>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Email or call the Data Mahder administrator and include the
              project or task name if relevant.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <a
                href="mailto:hello@mahder.ai"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-800 ring-1 ring-gray-200 hover:bg-gray-50"
              >
                <Mail aria-hidden="true" className="h-4 w-4 text-primary" />
                hello@mahder.ai
              </a>
              <a
                href="tel:+251900000000"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-800 ring-1 ring-gray-200 hover:bg-gray-50"
              >
                <Phone aria-hidden="true" className="h-4 w-4 text-primary" />
                +251900000000
              </a>
            </div>
          </section>
        </main>
      ) : null}
    </AuthenticatedPage>
  );
}
