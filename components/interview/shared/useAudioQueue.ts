"use client";

import { useCallback, useRef } from "react";

export function useAudioQueue() {
  const ctxRef = useRef<AudioContext | null>(null);
  const queueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);
  const onQueueEndCallbackRef = useRef<(() => void) | null>(null);

  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume().catch(() => {});
    }
    return ctxRef.current;
  }, []);

  const playNext = useCallback(async () => {
    if (isPlayingRef.current || queueRef.current.length === 0) {
      if (queueRef.current.length === 0 && !isPlayingRef.current) {
        const cb = onQueueEndCallbackRef.current;
        if (cb) {
          onQueueEndCallbackRef.current = null;
          cb();
        }
      }
      return;
    }

    const base64 = queueRef.current.shift()!;
    isPlayingRef.current = true;

    try {
      const ctx = getContext();

      // Ensure context is running before decoding/playing — await the resume
      if (ctx.state !== "running") {
        await ctx.resume();
      }

      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const audioBuffer = await ctx.decodeAudioData(bytes.buffer);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      source.onended = () => {
        isPlayingRef.current = false;
        playNext();
      };

      source.start(0);
    } catch {
      isPlayingRef.current = false;
      playNext();
    }
  }, [getContext]);

  const enqueue = useCallback(
    (base64: string) => {
      queueRef.current.push(base64);
      playNext();
    },
    [playNext],
  );

  const onQueueEnd = useCallback((cb: () => void) => {
    if (queueRef.current.length === 0 && !isPlayingRef.current) {
      cb();
    } else {
      onQueueEndCallbackRef.current = cb;
    }
  }, []);

  const stopAll = useCallback(() => {
    queueRef.current = [];
    isPlayingRef.current = false;
    onQueueEndCallbackRef.current = null;
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
  }, []);

  return { enqueue, getContext, onQueueEnd, stopAll };
}
