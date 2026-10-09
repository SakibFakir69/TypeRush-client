"use client";

import { useEffect, useMemo, useState } from "react";

export function useTypingTest(target: string) {
  const [typed, setTyped] = useState("");
  const [duration, setDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!started || finished) return;
    if (timeLeft <= 0) return;
    const t = setTimeout(() => {
      if (timeLeft - 1 <= 0) setFinished(true);
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [started, finished, timeLeft]);

  const { errors, accuracy, wpm } = useMemo(() => {
    let err = 0;
    let correct = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === target[i]) correct++;
      else err++;
    }
    const acc =
      typed.length === 0 ? 100 : Math.max(0, Math.round((correct / typed.length) * 100));
    const elapsed = duration - timeLeft;
    const minutes = elapsed > 0 ? elapsed / 60 : 1 / 60;
    return {
      errors: err,
      accuracy: acc,
      wpm: started ? Math.round(correct / 5 / minutes) : 97,
    };
  }, [typed, started, timeLeft, duration, target]);

  const reset = (d?: number) => {
    const nd = d ?? duration;
    setDuration(nd);
    setTimeLeft(nd);
    setTyped("");
    setStarted(false);
    setFinished(false);
  };

  const onChange = (v: string) => {
    if (finished) return;
    if (!started && v.length > 0) setStarted(true);
    if (v.length <= target.length) setTyped(v);
    if (v.length >= target.length) setFinished(true);
  };

  return {
    typed,
    timeLeft,
    started,
    finished,
    errors,
    accuracy,
    wpm,
    duration,
    setDuration,
    reset,
    onChange,
  };
}
