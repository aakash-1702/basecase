"use client";

import { useState, useRef, useCallback } from "react";

interface UseAudioPlayerReturn {
  playAudio: (base64: string) => Promise<void>;
  isPlaying: boolean;
  needsManualPlay: boolean;
  triggerManualPlay: () => void;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsManualPlay, setNeedsManualPlay] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const pendingResolveRef = useRef<(() => void) | null>(null);
  const pendingBase64Ref = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playAudio = useCallback(
    (base64: string): Promise<void> => {
      return new Promise((resolve) => {
        try {
          cleanup();

          // Decode base64 to binary
          const binaryString = atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          // Create blob and URL
          const blob = new Blob([bytes], { type: "audio/wav" });
          const url = URL.createObjectURL(blob);
          blobUrlRef.current = url;

          const audio = new Audio(url);
          audioRef.current = audio;

          audio.onended = () => {
            cleanup();
            resolve();
          };

          audio.onerror = () => {
            // On error, resolve immediately (never reject)
            // This allows the interview to continue in text-only mode
            cleanup();
            resolve();
          };

          // Try to play
          const playPromise = audio.play();

          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsPlaying(true);
                setNeedsManualPlay(false);
              })
              .catch(() => {
                // Autoplay blocked by browser
                // Store for manual play
                pendingBase64Ref.current = base64;
                pendingResolveRef.current = resolve;
                setNeedsManualPlay(true);
                setIsPlaying(false);
              });
          }
        } catch {
          // On any error, resolve immediately
          cleanup();
          resolve();
        }
      });
    },
    [cleanup],
  );

  const triggerManualPlay = useCallback(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      const resolve = pendingResolveRef.current;

      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setNeedsManualPlay(false);
          pendingResolveRef.current = null;
          pendingBase64Ref.current = null;
        })
        .catch(() => {
          // Still can't play, resolve anyway
          cleanup();
          if (resolve) resolve();
          pendingResolveRef.current = null;
        });
    }
  }, [cleanup]);

  return {
    playAudio,
    isPlaying,
    needsManualPlay,
    triggerManualPlay,
  };
}
