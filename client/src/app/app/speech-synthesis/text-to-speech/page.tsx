import { PageLayout } from "~/components/client/page-layout";
import { TextToSpeechEditor } from "../../../../components/client/speech-synthesis/text-to-speech-editor";

export default async function TextToSpeechPage() {
  const service = "styletts2";

  return (
    <PageLayout
      title={"Text to Speech"}
      service={service}
      showSidebar={true}
    >
      <TextToSpeechEditor service="styletts2" credits={9999} />
    </PageLayout>
  );
}
