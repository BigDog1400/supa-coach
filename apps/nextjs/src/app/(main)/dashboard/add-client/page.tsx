import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import AddClientForm from "~/components/add-client";
import Dashboard from "~/components/dashboard";
import PageContainer from "~/components/layout/page-container";
import { api, HydrateClient } from "~/trpc/server";

export const runtime = "edge";

export default function AddClientPage() {
  return (
    <PageContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Suspense fallback={<div>Loading...</div>}>
            <AddClientForm />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </PageContainer>
  );
}
