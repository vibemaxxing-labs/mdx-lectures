import { lectureRegistry, type LectureMap } from "./content/lectures";
import { Deck } from "./presentation/Deck";
import { LectureIndex } from "./presentation/LectureIndex";
import { parseRoute } from "./routes";

type AppProps = {
  lectures?: LectureMap;
};

export function App({ lectures = lectureRegistry }: AppProps) {
  const route = parseRoute(window.location.pathname);

  if (route.kind === "root") {
    return <LectureIndex lectures={lectures} />;
  }

  return <Deck lectures={lectures} />;
}
