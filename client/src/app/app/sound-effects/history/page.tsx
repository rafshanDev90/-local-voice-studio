import { PageLayout } from "~/components/client/page-layout";

export default async function SoundEffectsHistoryPage() {
  const soundEffectsTabs = [
    {
      name: "Generate",
      path: "/app/sound-effects/generate",
    },
    {
      name: "History",
      path: "/app/sound-effects/history",
    },
  ];

  const service = "make-an-audio";

  return (
    <PageLayout
      title={"Sound Effects"}
      showSidebar={false}
      tabs={soundEffectsTabs}
      service={service}
    >
      <div className="flex h-full items-center justify-center text-gray-500">
        No history yet
      </div>
    </PageLayout>
  );
}
