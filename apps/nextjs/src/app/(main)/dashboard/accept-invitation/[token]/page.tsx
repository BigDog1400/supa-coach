import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import PageContainer from "~/components/layout/page-container";
import { api } from "~/trpc/react";
import { HydrateClient } from "~/trpc/server";

function AcceptInvitation() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const acceptInvitationMutation = api.client.acceptInvitation.useMutation({
    onSuccess: () => {
      // Redirect to login page or dashboard
      router.push("/login");
    },
    onError: (error) => {
      setIsLoading(false);
      setError(
        error.message || "An error occurred while accepting the invitation.",
      );
    },
  });

  useEffect(() => {
    if (token && typeof token === "string") {
      acceptInvitationMutation.mutate({ token });
    }
  }, [token]);

  if (isLoading) {
    return <div>Processing invitation...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>Invitation accepted successfully. Redirecting to dashboard...</div>
  );
}

export const runtime = "edge";

export default function AddClientPage() {
  return (
    <PageContainer>
      <HydrateClient>
        <AcceptInvitation />
      </HydrateClient>
    </PageContainer>
  );
}
