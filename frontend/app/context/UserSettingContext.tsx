import { createContext, useContext, useEffect, useState } from "react";

type Settings = {
    // personal_inf: { avatar: string; displayName: string };
    general_settings: {
        backgroundMusic: boolean;
        soundEffects: boolean;
        questionTimer: boolean;
        questionCount: number;
    };
};

type UserSettingsContextType = {
    settings: Settings | null;
    setSettings: (value: Settings) => void;
};

const UserSettingsContext = createContext<UserSettingsContextType | null>(null);

export function UserSettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<Settings | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem('userSettings');
        if (raw) {
            setSettings(JSON.parse(raw));
        }
    }, []);

    return (
        <UserSettingsContext.Provider value={{ settings, setSettings }}>
            {children}
        </UserSettingsContext.Provider>
    );
}

export function useUserSettings() {
    const context = useContext(UserSettingsContext);
    if (!context) throw new Error("useUserSettings must be used inside UserSettingsProvider");
    return context;
}
