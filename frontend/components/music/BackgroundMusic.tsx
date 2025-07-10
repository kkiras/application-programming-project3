'use client';
import { useUserSettings } from "@/app/context/UserSettingContext";
import { useEffect, useRef, useState } from "react";

export default function BackgroundMusic() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [started, setStarted] = useState(false);
    const { settings: userSettings } = useUserSettings();
    const isBackgroundMusicAllowed = userSettings?.general_settings.backgroundMusic

    useEffect(() => {
        if (!isBackgroundMusicAllowed) {
            // Nếu nhạc đang chạy thì dừng lại
            const audio = audioRef.current;
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
            setStarted(false);
            return;
        }

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
    }, [started, isBackgroundMusicAllowed]);

    if (!isBackgroundMusicAllowed) return

    return (
        <audio ref={audioRef} src="/background-music.mp3" loop />
    );
}