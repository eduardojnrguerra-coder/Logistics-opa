import { PageHeader } from "@/components/ui/Card";
import { TrackingConsole } from "@/components/tracking/TrackingConsole";

export default function TrackingPage() {
  return (
    <>
      <PageHeader
        title="Live tracking"
        description="Fleet positions on the road network, with speed, heading, and arrival estimates."
      />
      <TrackingConsole />
    </>
  );
}
