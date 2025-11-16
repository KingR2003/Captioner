// remotion/Root.tsx
import { Composition } from "remotion";
import { CaptionVideo } from "./CaptionVideo";

// Wrap CaptionVideo into a loose-typed component with defaultProps to satisfy Composition typing
const InlineCaption: any = (props: any) => {
  return <CaptionVideo {...props} />;
};
InlineCaption.defaultProps = {
  videoSrc: "",
  captions: [],
  stylePreset: "bottom",
};
// Workaround TS typing mismatch by using a loosened Composition reference
const CompositionAny: any = Composition;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <CompositionAny
        id="CaptionVideo"
        component={InlineCaption}
        durationInFrames={300}   // temporary placeholder
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          videoSrc: "",
          captions: [],
          stylePreset: "bottom",
        }}
      />
    </>
  );
};
