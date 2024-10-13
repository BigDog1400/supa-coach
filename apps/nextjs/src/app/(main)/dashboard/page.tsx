import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import Dashboard from "~/components/dashboard";
import PageContainer from "~/components/layout/page-container";
import { api, HydrateClient } from "~/trpc/server";

export const runtime = "edge";

export default function DashboardPage() {
  void api.dashboard.getDashboardStats.prefetch();

  return (
    <PageContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Suspense fallback={<div>Loading...</div>}>
            <Dashboard />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </PageContainer>
  );
}
