'use client';
import { useUserSettings } from "../context/UserSettingContext";

export default function Page() {
    const userSettings = useUserSettings();

    console.log("Dashboard settings:", userSettings);

    return (
        <div>
            <pre>{JSON.stringify(userSettings, null, 2)}</pre>
        </div>
    );
}
