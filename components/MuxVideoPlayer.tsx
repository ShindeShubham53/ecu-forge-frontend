'use client';

import React from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { Play, AlertCircle } from 'lucide-react';

interface MuxVideoPlayerProps {
  playbackId?: string;
  playbackToken?: string;
  title?: string;
  autoPlay?: boolean;
  className?: string;
  onEnded?: () => void;
  onError?: (error: any) => void;
}

export const MuxVideoPlayer: React.FC<MuxVideoPlayerProps> = ({
  playbackId,
  playbackToken,
  title = 'ECU FORGE Masterclass Technical Session',
  autoPlay = false,
  className = '',
  onEnded,
  onError,
}) => {
  if (!playbackId) {
    return (
      <div className="w-full aspect-video rounded-2xl bg-brand-surface border border-brand-border flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-brand-dark flex items-center justify-center text-brand-silver">
          <Play className="w-6 h-6" />
        </div>
        <p className="text-sm font-mono text-brand-silver font-bold">
          No Mux video stream available for this lecture.
        </p>
      </div>
    );
  }

  const tokens = playbackToken ? { playback: playbackToken } : undefined;

  return (
    <div className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-brand-border shadow-[0_0_30px_rgba(0,0,0,0.8)] ${className}`}>
      <MuxPlayer
        playbackId={playbackId}
        tokens={tokens}
        streamType="on-demand"
        accentColor="#00FF66"
        title={title}
        autoPlay={autoPlay}
        onEnded={onEnded}
        onError={onError}
        style={{
          aspectRatio: '16/9',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

export default MuxVideoPlayer;
