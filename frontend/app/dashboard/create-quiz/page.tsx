"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Save, Wand2 } from "lucide-react";
import { useState } from "react";

export default function Page() {
    const [question, setQuestion] = useState("");
    const [answers, setAnswers] = useState(["", "", "", ""]);

    const [aiQuestionCount, setAiQuestionCount] = useState(5);

    const handleAnswerChange = (index: number, value: string) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    }

    const handleGenerateQuestions = async () => {
        try {
            const response = await fetch("http://localhost:8000/generate-questions")
            if (!response.ok) {
                throw new Error("Failed to generate questions");
            }
            const data = await response.json();
            console.log("Generated questions:", data);
        } catch (error) {
            console.error("Error generating questions:", error);
        }
    }
    return (
        <div>
            <h1>Tạo bài quiz</h1>
            <Tabs>
                <TabsList>
                    <TabsTrigger value="by-manual">Thủ công</TabsTrigger>
                    <TabsTrigger value="by-ai">Tự động</TabsTrigger>
                </TabsList>

                <TabsContent value="by-manual">
                    <Card className="bg-gray-800/50 border-purple-500/30 text-white">
                        <CardHeader>
                            <CardTitle>
                                Thông tin câu hỏi
                            </CardTitle>
                            <CardContent className="space-y-6 p-0">
                                <div>
                                    <Label htmlFor="question" className="">
                                        Câu hỏi
                                    </Label>
                                    <Textarea
                                        id="question"
                                        value={question}
                                        placeholder="Nhập câu hỏi"
                                        onChange={(e) => setQuestion(e.target.value)}
                                        className="bg-gray-700 border-gray-600 placeholder-gray-400 mt-2"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label>
                                        Đáp án
                                        <span> *Chọn 1 đáp án đúng</span>
                                    </Label>
                                    <div className="space-y-3 mt-3">
                                        {answers.map((ans, index) => (
                                            <div className="flex items-center space-x-3" key={index}>
                                                <input
                                                    id={`answer-${index}`}
                                                    type="radio"
                                                    name="correct-answer"

                                                />
                                                <Label htmlFor={`answer-${index}`}>
                                                    {["A.", "B.", "C.", "D."][index] ?? "Unknown"}
                                                </Label>
                                                <Input
                                                    value={ans}
                                                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                                                    placeholder={`Đáp án ${["A", "B", "C", "D"][index] ?? "Unknown"}`}
                                                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-4 pt-4">
                                    <Button
                                        variant="outline"
                                        className="bg-gray-600 border-gray-600 text-gray-300 hover:bg-gray-700"
                                        onClick={() => {
                                            setQuestion("");
                                            setAnswers(["", "", "", ""]);

                                        }}
                                    >
                                        Xóa tất cả
                                    </Button>

                                    <Button

                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                        disabled={!question || answers.some((a) => !a)}
                                    >
                                        <Save className="w-4 h-4" />
                                        Thêm câu hỏi
                                    </Button>
                                </div>
                            </CardContent>
                        </CardHeader>
                    </Card>
                </TabsContent>

                <TabsContent value="by-ai">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Tạo câu hỏi bằng AI
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <Label>
                                    Số lượng câu hỏi cần tạo (5-10)
                                </Label>
                                <div className="flex space-x-3 mt-2">
                                    <Input
                                        id="question-count"
                                        type="number"
                                        min="5"
                                        max="10"
                                        value={aiQuestionCount}
                                        onChange={() => { }}
                                        className="w-16 bg-gray-700 border-gray-600 text-white"
                                    />

                                    <Button
                                        className="bg-purple-600 hover:bg-purple-700"
                                        onClick={handleGenerateQuestions}
                                    >
                                        <Wand2 className="w-4 h-4" />
                                        Tạo câu hỏi
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>


    )
}