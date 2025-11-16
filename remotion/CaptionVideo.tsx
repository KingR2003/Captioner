import { AbsoluteFill, Video, Sequence, useVideoConfig } from "remotion";

type Caption = {
  start: number;   // caption start (seconds)
  end: number;     // caption end (seconds)
  text: string;    // caption text
};


export const CaptionVideo: React.FC<{
  videoSrc: string;
  captions: Caption[];
  stylePreset: "bottom" | "top" | "karaoke";
}> = ({ videoSrc, captions, stylePreset }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Main video */}
      <Video src={videoSrc} />

      {/* Render captions */}
      {captions.map((cap, index) => {
        const startFrame = Math.floor(cap.start * fps);
        const endFrame = Math.floor(cap.end * fps);
        const duration = endFrame - startFrame;

        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={duration}
          >
            <CaptionRenderer text={cap.text} preset={stylePreset} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

(CaptionVideo as any).defaultProps = {
  videoSrc: "",
  captions: [],
  stylePreset: "bottom",
};

const CaptionRenderer: React.FC<{
  text: string;
  preset: "bottom" | "top" | "karaoke";
}> = ({ text, preset }) => {
  // Base caption style
  const baseStyle: React.CSSProperties = {
    fontSize: 48,
    fontFamily: "NotoSans, NotoSansDevanagari",
    textAlign: "center",
    color: "white",
    padding: "20px 40px",
    width: "100%",
    position: "absolute",
    textShadow: "2px 2px 8px rgba(0,0,0,0.8)",
  };

  // Bottom Preset
  if (preset === "bottom") {
    return <div style={{ ...baseStyle, bottom: 80 }}>{text}</div>;
  }

  // Top Bar Preset
  if (preset === "top") {
    return (
      <div
        style={{
          ...baseStyle,
          top: 80,
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        {text}
      </div>
    );
  }

  // Karaoke Preset (simple golden style)
  return (
    <div
      style={{
        ...baseStyle,
        bottom: 80,
        color: "#ffd700",
      }}
    >
      {text}
    </div>
  );
};
