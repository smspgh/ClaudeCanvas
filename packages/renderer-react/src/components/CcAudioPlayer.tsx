import type { AudioPlayerComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

export interface CcAudioPlayerProps {
  component: AudioPlayerComponent;
  dataModel: DataModel;
}

export function CcAudioPlayer({ component, dataModel }: CcAudioPlayerProps) {
  const getSrc = (): string | null => {
    if (component.src) {
      return component.src;
    }
    if (component.srcPath) {
      const value = getByPointer(dataModel, component.srcPath);
      if (value != null && typeof value === 'string') {
        return value;
      }
    }
    return null;
  };

  const src = getSrc();
  const controls = component.controls ?? true;

  if (!src) {
    return (
      <div className="cc-audio-player cc-audio-empty">
        <div className="cc-audio-placeholder">No audio source</div>
      </div>
    );
  }

  return (
    <div className="cc-audio-player">
      {component.title && <div className="cc-audio-title">{component.title}</div>}
      <audio
        src={src}
        autoPlay={component.autoplay}
        controls={controls}
        loop={component.loop}
      />
    </div>
  );
}
