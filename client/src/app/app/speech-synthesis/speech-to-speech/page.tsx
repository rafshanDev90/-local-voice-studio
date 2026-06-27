import { PageLayout } from "~/components/client/page-layout";
import { VoiceChanger } from "~/components/client/speech-synthesis/voice-changer";

export default async function SpeechToSpeechPage() {
  const service = "seedvc";

  return (
    <PageLayout
      title={"Voice Changer"}
      service={service}
      showSidebar={true}
    >
      <VoiceChanger credits={0} service={service} />
    </PageLayout>
  );
}
