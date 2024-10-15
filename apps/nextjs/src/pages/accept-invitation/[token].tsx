import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { api } from "~/trpc/react";

export default function AcceptInvitation() {
  const router = useRouter();
  const { token } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const acceptInvitationMutation = api.client.acceptInvitation.useMutation({
    onSuccess: () => {
      // Redirect to login page or dashboard
      router.push("/login");
    },
    onError: (error) => {
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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>Accepting invitation...</div>;
}
