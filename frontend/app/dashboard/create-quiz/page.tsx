"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import clsx from "clsx";
import { Check, Pencil, Save, Wand2 } from "lucide-react";
import { useState } from "react";

export default function Page() {
    type Question = {
        num: number;
        question: string;
        answers: string[];
        correctAnswer: string;
    }
    const [question, setQuestion] = useState("");
    const [answers, setAnswers] = useState(["", "", "", ""]);

    const [aiQuestionCount, setAiQuestionCount] = useState(5);
    const [aiQuestions, setAiQuestions] = useState<Question[]>([]);

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
            console.log(typeof data);
            if (Array.isArray(data)) {
                setAiQuestions(data);
            } else {
                console.error("Invalid data format:", data);
                setAiQuestions([]);
            }
        } catch (error) {
            console.error("Error generating questions:", error);
        }
    }
    return (
        <div>
            <h1 className="text-white text-4xl mb-8 font-bold">Tạo bài quiz</h1>
            <Tabs defaultValue="by-manual">
                <TabsList className="bg-gray-800/50 border-b border-purple-500/30 text-gray-400 mb-2">
                    <TabsTrigger value="by-manual" className="text-lg px-5">Thủ công</TabsTrigger>
                    <TabsTrigger value="by-ai" className="text-lg px-5">Tự động</TabsTrigger>
                </TabsList>

                <TabsContent value="by-manual">
                    <Card className="bg-gray-800/50 border-purple-500/30 text-white">
                        <CardHeader>
                            <CardTitle className="text-2xl font-semibold">
                                Thông tin câu hỏi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
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
                    </Card>
                </TabsContent>

                <TabsContent value="by-ai">
                    <Card className="bg-gray-800/50 border-purple-500/30 text-white">
                        <CardHeader>
                            <CardTitle className="text-2xl font-semibold">
                                Tạo câu hỏi bằng AI
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label htmlFor="question-count">
                                    Số lượng câu hỏi cần tạo (5-10)
                                </Label>
                                <div className="flex space-x-4 mt-2">
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

                    {aiQuestions.length > 0 && (
                        <div className="space-y-6 mt-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">Câu hỏi đã tạo</h2>
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Check className="w-4 h-4" />
                                    Lưu tất cả câu hỏi
                                </Button>
                            </div>

                            {aiQuestions.map((q, index) => (
                                <Card key={index} className="bg-gray-800/50 border-purple-500/30">
                                    <CardContent className="p-6 text-white">
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-medium text-lg">
                                                    Câu {index + 1} : {q.question}
                                                </h3>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                    Sửa
                                                </Button>
                                            </div>

                                            <div className="space-y-2">
                                                {q.answers.map((ans, ansIndex) => (
                                                    <div
                                                        key={ansIndex}
                                                        className={clsx(
                                                            'p-3 rounded-lg',
                                                            {
                                                                'bg-green-900/30 border border-green-500/50': q.correctAnswer === ans,
                                                                'bg-gray-700/30': q.correctAnswer !== ans
                                                            }
                                                        )}
                                                    >
                                                        <span className="text-gray-300">
                                                            {["A.", "B.", "C.", "D."][ansIndex] ?? "Unknown"} {ans}
                                                            {q.correctAnswer === ans && (
                                                                <span className="text-green-400 ml-2">Đáp án đúng</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}


                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>


    )
}