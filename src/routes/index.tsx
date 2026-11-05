import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

// The game site keeps progress in the browser and uses hash pages (#/games, #/rating, ...),
// so it renders only in the browser.
const Site = lazy(() => import("@/arena/Site"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "English Arena — O'yna, o'rgan, g'olib bo'l!" },
      {
        name: "description",
        content: "Ingliz tilini o'yin orqali o'rgan: so'z o'yinlari, kunlik vazifalar va guruh reytingi. 3-sinfdan 18–20 yoshgacha.",
      },
      { property: "og:title", content: "English Arena — O'yna, o'rgan, g'olib bo'l!" },
      {
        property: "og:description",
        content: "Ingliz tilini o'yin orqali o'rgan: so'z o'yinlari, kunlik vazifalar va guruh reytingi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const Loading = () => <div className="arena-loading">🏟️ English Arena…</div>;

function Index() {
  return (
    <ClientOnly fallback={<Loading />}>
      <Suspense fallback={<Loading />}>
        <Site />
      </Suspense>
    </ClientOnly>
  );
}
