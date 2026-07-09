import { PageLayout } from "~/components/client/page-layout";
import { AudiobookEditor } from "~/components/client/audiobook/audiobook-editor";

export default async function AudiobookPage() {
  const service = "styletts2";

  return (
    <PageLayout
      title="Audiobook"
      service={service}
      showSidebar={true}
    >
      <AudiobookEditor />
    </PageLayout>
  );
}
