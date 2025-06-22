"use client";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@radix-ui/react-avatar";
import { useRef, useState } from "react";
import { ArrowUpFromLine, Save } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";


export default function Page() {
    const [settings, setSettings] = useState({

        questionCount: 5
    })
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const openDialog = () => {
        fileInputRef.current?.click();
    };
    return (
        <div>
            <h1 className="text-white">Cài đặt</h1>

            <div className="space-y-6">
                <Card className="bg-gray-800/50 border-purple-500/30">
                    <CardHeader>
                        <CardTitle className="text-white">Thông tin cá nhân</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Avatar className="w-20 h-20">
                                <AvatarImage
                                    src=""
                                    alt=""
                                />
                                <AvatarFallback></AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-white font-medium mb-2">User</h2>
                                <input id="fileID" type="file" ref={fileInputRef} hidden />
                                <Button
                                    id="upload-avatar-button"
                                    variant="outline"
                                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
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
                        <CardTitle className="text-white">Cài đặt bài thi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div>
                            <Label className="text-white mb-2" htmlFor="question-count">
                                Số câu hỏi mặc định
                            </Label>
                            <div className="flex items-center space-x-4">
                                <Input
                                    id="question-count"
                                    type="number"
                                    min="5"
                                    max="10"
                                    value={settings.questionCount}
                                    onChange={() => { }}
                                    className="w-16 bg-gray-700 border-gray-600 text-white"
                                />
                                <span className="text-gray-400">Từ 5 đến 10 câu hỏi</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-purple-500/30">
                    <CardHeader>
                        <CardTitle className="text-white">Cài đặt chức năng</CardTitle>
                    </CardHeader>
                    <CardContent >
                        <div className="grid gap-6">
                            <div className="flex items-center justify-between">
                                <Label className="text-white font-medium" htmlFor="function-a">
                                    Chức năng A
                                </Label>
                                <Switch
                                    id="function-a"
                                    checked={true}
                                    onCheckedChange={() => { }}

                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label className="text-white font-medium" htmlFor="function-a">
                                    Chức năng A
                                </Label>
                                <Switch
                                    id="function-a"
                                    checked={true}
                                    onCheckedChange={() => { }}

                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label className="text-white font-medium" htmlFor="function-a">
                                    Chức năng A
                                </Label>
                                <Switch
                                    id="function-a"
                                    checked={true}
                                    onCheckedChange={() => { }}

                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label className="text-white font-medium" htmlFor="function-a">
                                    Chức năng A
                                </Label>
                                <Switch
                                    id="function-a"
                                    checked={true}
                                    onCheckedChange={() => { }}

                                />
                            </div>

                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button className="bg-purple-600 text-white hover:bg-purple-700 px-8">
                        <Save className="w-4 h-4 mr-2" />
                        Lưu cài đặt
                    </Button>
                </div>
            </div>

        </div>


    )
}