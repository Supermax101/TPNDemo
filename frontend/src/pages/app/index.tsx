import { useEffect } from "react";
import { Container, Center, Text, Stack, Button } from "@mantine/core";
import { useRouter } from "next/router";

/**
 * This route is no longer used after removing Epic and SMART Health IT OAuth2 flows.
 * Redirects users back to the home page to select HAPI or Mock launch options.
 */
export default function AppIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page after a brief delay
    const timeout = setTimeout(() => {
      router.push("/");
    }, 2000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <Container p={20} size="xl">
      <Center style={{ minHeight: "50vh" }}>
        <Stack align="center" gap="md">
          <Text size="xl" fw={600}>
            OAuth2 flows have been removed
          </Text>
          <Text c="dimmed">
            Redirecting to launch page...
          </Text>
          <Button onClick={() => router.push("/")}>
            Go to Launch Page
          </Button>
        </Stack>
      </Center>
    </Container>
  );
}

