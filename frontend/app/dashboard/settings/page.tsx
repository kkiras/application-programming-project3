"use client";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@radix-ui/react-avatar";
import { ChangeEvent, use, useEffect, useRef, useState } from "react";
import { ArrowUpFromLine, Save, User } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUserSettings } from "@/app/context/UserSettingContext";
import { getAuth } from "firebase/auth";


export default function Page() {
    type GeneralSettingKey = 'backgroundMusic' | 'soundEffects' | 'questionTimer';

    const { settings: userSettings, setSettings } = useUserSettings();
    const [selectedImg, setSelectedImg] = useState<File | undefined>()
    const [preview, setPreview] = useState<string | undefined>()

    const baseSettings = {
        questionCount: userSettings?.general_settings.questionCount as number,
        backgroundMusic: userSettings?.general_settings.backgroundMusic as boolean,
        soundEffects: userSettings?.general_settings.soundEffects as boolean,
        questionTimer: userSettings?.general_settings.questionTimer as boolean,
    };

    const [generalSettings, setGeneralSettings] = useState({
        ...baseSettings
    });

    useEffect(() => {
        if (!selectedImg) {
            setPreview(undefined)
            return
        }

        const objectURL = URL.createObjectURL(selectedImg)
        setPreview(objectURL)

        return () => URL.revokeObjectURL(objectURL)

    }, [selectedImg])

    useEffect(() => {
        console.log("General settings updated:", generalSettings);
        console.log("Base settings:", baseSettings)
    }, [generalSettings]);

    const settingsOptions: { key: GeneralSettingKey; label: string }[] = [
        { key: 'backgroundMusic', label: 'Nhạc nền' },
        { key: 'soundEffects', label: 'Âm thanh tương tác' },
        { key: 'questionTimer', label: 'Bộ đếm thời gian câu hỏi' },
    ]
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const openDialog = () => {
        fileInputRef.current?.click();
    };

    const handleSetImg = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            setSelectedImg(undefined)
            return
        }

        setSelectedImg(e.target.files[0])
    }

    const handleSaveChanges = async () => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            const uid = user?.uid
            const res = await fetch('http://localhost:8000/api/save-setting-changes', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ changes: generalSettings, uid: uid })
            })

            if (res.ok) {
                alert("Saved successfully")

                const updated = {
                    ...userSettings,
                    general_settings: generalSettings
                }

                localStorage.setItem('userSettings', JSON.stringify(updated));
                setSettings(updated);
            }
        } catch (error: any) {
            console.error("Lỗi không xác định:", error.message);
        }

    }

    return (
        <div>
            <h1 className="text-white text-4xl mb-8 font-bold">Cài đặt</h1>

            <div className="space-y-6">
                <Card className="bg-gray-800/50 border-purple-500/30">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold text-white">Thông tin cá nhân</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="flex items-center gap-4">
                            {!selectedImg ? (
                                <div className="w-20 h-20 rounded-full overflow-hidden bg-purple-600 flex items-center justify-center">
                                    <User color="#ffffff" className="w-11 h-11 object-cover color-white" />
                                </div>
                            ) : (
                                <Avatar className="w-20 h-20 rounded-full overflow-hidden">
                                    <AvatarImage
                                        src={preview}
                                        alt=""
                                    />
                                    <AvatarFallback></AvatarFallback>
                                </Avatar>
                            )}

                            <div>
                                <h2 className="text-white font-medium mb-2 text-lg">User</h2>
                                <input
                                    id="fileID"
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleSetImg}
                                    hidden />
                                <Button
                                    id="upload-avatar-button"
                                    variant="outline"
                                    className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-700"
                                    onClick={openDialog}
                                >
                                    <ArrowUpFromLine />
                                    Upload
                                </Button>
                            </div>
                        </div>

                    </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-purple-500/30">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold text-white">Cài đặt chung</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div>
                            <Label className="text-white mb-2 text-base" htmlFor="question-count">
                                Số câu hỏi mặc định
                            </Label>
                            <div className="flex items-center space-x-4 mt-2">
                                <Input
                                    id="question-count"
                                    type="number"
                                    min="5"
                                    max="10"
                                    value={generalSettings.questionCount}
                                    onChange={(e) => {
                                        const raw = e.target.value;
                                        const parsed = parseInt(raw, 10);

                                        if (!isNaN(parsed) && parsed <= 10) {
                                            setGeneralSettings((prev) => ({
                                                ...prev,
                                                questionCount: parsed,
                                            }));
                                        }
                                    }}
                                    className="w-16 bg-gray-700 border-gray-600 text-white"
                                />
                                <span className="text-gray-400">Từ 5 đến 10 câu hỏi</span>
                            </div>
                        </div>

                        <div className="grid gap-7 mt-8">
                            {settingsOptions.map(option => (
                                <div className="flex items-center justify-between" key={option.key}>
                                    <Label className="text-white text-base" htmlFor={option.key}>
                                        {option.label}
                                    </Label>
                                    <Switch
                                        id="background-music"
                                        checked={generalSettings[option.key]}
                                        onCheckedChange={() => {
                                            setGeneralSettings((prev) => (
                                                { ...prev, [option.key]: !prev[option.key] }
                                            ))
                                        }}
                                        className="data-[state=checked]:bg-purple-700 data-[state=unchecked]:bg-gray-500"

                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button
                        disabled={JSON.stringify(generalSettings) === JSON.stringify(baseSettings)}
                        className="bg-purple-600 text-white hover:bg-purple-700 px-8"
                        onClick={handleSaveChanges}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Lưu cài đặt
                    </Button>
                </div>
            </div>

        </div >


    )
}