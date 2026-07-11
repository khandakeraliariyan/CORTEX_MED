import { PatientQueueTrackingPage } from "@/components/cortex/pages";

export default async function TrackQueue({
  params,
}: {
  params: Promise<{ queueId: string }>;
}) {
  const { queueId } = await params;
  return <PatientQueueTrackingPage initialCode={decodeURIComponent(queueId)} />;
}
