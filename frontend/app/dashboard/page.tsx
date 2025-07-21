'use client';
import { useUserSettings } from "../context/UserSettingContext";

export default function Page() {
    const userSettings = useUserSettings();

    console.log("Dashboard settings:", userSettings);

    return (
        <div className="h-full">
            <h1 className="text-white text-4xl mb-8 font-bold">Trang chủ</h1>
            <div className="flex flex-col items-center justify-center h-full text-white pb-28">
                <h1 className="text-2xl font-bold max-w-lg text-center">Trang web luyện thi trắc nghiệm kiến thức chuyên ngành Công Nghệ Thông Tin</h1>
            </div>
        </div>
    );
}
