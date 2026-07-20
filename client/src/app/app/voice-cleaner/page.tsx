import { PageLayout } from "~/components/client/page-layout";
import { VoiceCleaner } from "~/components/client/voice-cleaner/voice-cleaner";

export default async function VoiceCleanerPage() {
  return (
    <PageLayout
      title="Voice Cleaner"
      service="styletts2"
      showSidebar={false}
    >
      <VoiceCleaner credits={9999} />
    </PageLayout>
  );
}
