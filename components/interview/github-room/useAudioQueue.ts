"use client";

import { useRef, useState, useCallback, useEffect } from "react";

/**
 * Custom hook for AudioContext-based WAV playback.
 * Decodes base64 WAV audio → AudioBuffer → queues back-to-back
 * with no gap between sentences. Does NOT use <audio> element.
 */
export function useAudioQueue() {
  const ctxRef = useRef<AudioContext | null>(null);
  const queueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const nextStartTimeRef = useRef(0);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const onEndCallbackRef = useRef<(() => void) | null>(null);

  // Initialize AudioContext lazily (must happen after user gesture)
  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  // Play next buffer in the queue
  const playNext = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || queueRef.current.length === 0) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      onEndCallbackRef.current?.();
      onEndCallbackRef.current = null;
      return;
    }

    isPlayingRef.current = true;
    setIsPlaying(true);

    const buffer = queueRef.current.shift()!;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    // Schedule at the end of the previous buffer (or now)
    const startTime = Math.max(ctx.currentTime, nextStartTimeRef.current);
    source.start(startTime);
    nextStartTimeRef.current = startTime + buffer.duration;
    currentSourceRef.current = source;

    source.onended = () => {
      currentSourceRef.current = null;
      if (queueRef.current.length > 0) {
        playNext();
      } else {
        isPlayingRef.current = false;
        setIsPlaying(false);
        onEndCallbackRef.current?.();
        onEndCallbackRef.current = null;
      }
    };
  }, []);

  // Enqueue a base64-encoded WAV string
  const enqueue = useCallback(
    async (base64: string) => {
      const ctx = getContext();

      try {
        // Decode base64 to ArrayBuffer
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));
        queueRef.current.push(audioBuffer);

        // Start playing if not already
        if (!isPlayingRef.current) {
          playNext();
        }
      } catch (err) {
        console.error("Audio decode error:", err);
        // Skip this chunk and try next
        if (!isPlayingRef.current && queueRef.current.length > 0) {
          playNext();
        }
      }
    },
    [getContext, playNext]
  );

  // Stop all playback and clear queue
  const stopAll = useCallback(() => {
    queueRef.current = [];
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch {
        // Already stopped
      }
      currentSourceRef.current = null;
    }
    isPlayingRef.current = false;
    nextStartTimeRef.current = 0;
    setIsPlaying(false);
  }, []);

  // Set callback for when the queue finishes playing
  const onQueueEnd = useCallback((cb: () => void) => {
    onEndCallbackRef.current = cb;
    // If not playing, fire immediately
    if (!isPlayingRef.current && queueRef.current.length === 0) {
      cb();
      onEndCallbackRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll();
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
      }
    };
  }, [stopAll]);

  return { enqueue, stopAll, isPlaying, onQueueEnd, getContext };
}
