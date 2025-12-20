import type { VideoComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

export interface CcVideoProps {
  component: VideoComponent;
  dataModel: DataModel;
}

export function CcVideo({ component, dataModel }: CcVideoProps) {
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
      <div className="cc-video cc-video-empty">
        <div className="cc-video-placeholder">No video source</div>
      </div>
    );
  }

  return (
    <div className="cc-video">
      <video
        src={src}
        poster={component.poster || undefined}
        autoPlay={component.autoplay}
        controls={controls}
        loop={component.loop}
        muted={component.muted}
        playsInline
      />
    </div>
  );
}
