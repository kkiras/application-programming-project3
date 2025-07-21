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

    const [changedSettings, setChangedSettings] = useState({
        ...userSettings!
    })

    useEffect(() => {
        if (!selectedImg) {
            setPreview(undefined)
            return
        }

        const objectURL = URL.createObjectURL(selectedImg)
        setPreview(objectURL)
        setChangedSettings((prev) => ({
            ...prev,
            personal_inf: {
                ...prev?.personal_inf,
                avatar: objectURL
            }
        }))

        return () => URL.revokeObjectURL(objectURL)

    }, [selectedImg])

    useEffect(() => {
        if (!changedSettings?.personal_inf || !changedSettings?.general_settings) return;
        console.log("Personal settings updated:", changedSettings.personal_inf);
        console.log("General settings updated:", changedSettings.general_settings);
        console.log("Base settings:", userSettings)
    }, [changedSettings]);

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
        const auth = getAuth();
        const user = auth.currentUser;
        const uid = user?.uid;

        if (!uid) return;

        const formData = new FormData();
        formData.append("uid", uid);

        if (selectedImg) {
            formData.append("file", selectedImg);
        }

        const isGeneralChanged = JSON.stringify(changedSettings.general_settings) !== JSON.stringify(userSettings!.general_settings);
        if (isGeneralChanged) {
            formData.append("general_settings", JSON.stringify(changedSettings.general_settings));
        }

        try {
            const res = await fetch("http://localhost:8000/api/save-settings", {
                method: "POST",
                body: formData
            });

            if (!res.ok) throw new Error(await res.text());

            const data = await res.json();
            const saved = data.updated
            console.log(saved)
            alert("Saved successfully");

            const updated = {
                ...userSettings!,
                general_settings: saved?.settings || userSettings!.general_settings,
                personal_inf: {
                    ...userSettings!.personal_inf,
                    ...(saved?.personal_inf || {})
                }
            };

            localStorage.setItem('userSettings', JSON.stringify(updated));
            setSettings(updated);
        } catch (err: any) {
            console.error("Lỗi không xác định:", err.message);
        }
    };

    console.log("Avatar src:", userSettings?.personal_inf?.avatar)

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
                            {(selectedImg || userSettings?.personal_inf?.avatar) ? (
                                <Avatar className="w-20 h-20 rounded-full overflow-hidden">
                                    <AvatarImage
                                        src={preview || `http://localhost:8000/avatars/${userSettings?.personal_inf.avatar}`}
                                        alt=""
                                    />
                                    <AvatarFallback></AvatarFallback>
                                </Avatar>
                            ) : (
                                <div className="w-20 h-20 rounded-full overflow-hidden bg-purple-600 flex items-center justify-center">
                                    <User color="#ffffff" className="w-11 h-11 object-cover color-white" />
                                </div>
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
                                    value={changedSettings?.general_settings?.questionCount}
                                    onChange={(e) => {
                                        const raw = e.target.value;
                                        const parsed = parseInt(raw, 10);

                                        if (!isNaN(parsed) && parsed <= 10) {
                                            setChangedSettings((prev) => ({
                                                ...prev,
                                                general_settings: {
                                                    ...prev.general_settings,
                                                    questionCount: parsed
                                                }
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
                                        id={option.key}
                                        checked={!!changedSettings?.general_settings?.[option.key]}
                                        onCheckedChange={() => {
                                            setChangedSettings((prev) => (
                                                {
                                                    ...prev,
                                                    general_settings: {
                                                        ...prev.general_settings,
                                                        [option.key]: !prev.general_settings[option.key]
                                                    }

                                                }
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
                        disabled={JSON.stringify(userSettings) === JSON.stringify(changedSettings)}
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