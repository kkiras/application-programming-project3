'use client';
import { useEffect, useRef, useState } from "react";

export default function BackgroundMusic() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const enableAudio = () => {
            const audio = audioRef.current;
            if (audio && !started) {
                audio.volume = 0.4;
                audio.play().then(() => {
                    setStarted(true);
                }).catch(err => {
                    console.warn("Autoplay blocked:", err);
                });
            }
        };

        window.addEventListener("click", enableAudio, { once: true });
        return () => window.removeEventListener("click", enableAudio);
    }, [started]);

    return (
        <audio ref={audioRef} src="/background-music.mp3" loop />
    );
}