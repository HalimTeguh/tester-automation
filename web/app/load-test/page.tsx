import { LoadTestConfigForm } from "@/components/load-test-config-form";

export default function LoadTestPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }> | { url?: string };
}) {
  const params = searchParams instanceof Promise ? {} : searchParams;
  return <LoadTestConfigForm initialUrl={params.url || ""} />;
}
