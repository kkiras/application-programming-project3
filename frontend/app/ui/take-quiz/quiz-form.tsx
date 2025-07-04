'use client';
import { useEffect, useState } from "react";
import Question from "./question";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface QuestionData {
    num: number;
    question: string;
    answers: string[];
    correctAnswer: string;
}

interface QuizFormProps {
    currentIndex: number;
    setIndex: (index: number) => void;
    trigger: boolean;
}

const questions: QuestionData[] = [
    {
        num: 1,
        question: "What is the capital of France?",
        answers: ["Paris", "London", "Berlin", "Madrid"],
        correctAnswer: "Paris"
    },
    {
        num: 2,
        question: "Which planet is known as the Red Planet?",
        answers: ["Earth", "Mars", "Jupiter", "Venus"],
        correctAnswer: "Mars"
    },
    {
        num: 3,
        question: "Who wrote 'Hamlet'?",
        answers: ["Charles Dickens", "Leo Tolstoy", "William Shakespeare", "Mark Twain"],
        correctAnswer: "William Shakespeare"
    },
    {
        num: 4,
        question: "What is the largest mammal in the world?",
        answers: ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
        correctAnswer: "Blue Whale"
    },
    {
        num: 5,
        question: "Which element has the chemical symbol 'O'?",
        answers: ["Gold", "Oxygen", "Iron", "Silver"],
        correctAnswer: "Oxygen"
    }
];

export default function QuizForm({ currentIndex, setIndex, trigger }: QuizFormProps) {
    const router = useRouter();
    useEffect(() => {
        if (trigger) {
            handleNext();
        }
    }, [trigger]);

    const [work, setWork] = useState<{ [key: number]: string }>(() =>
        questions.reduce((acc, _, index) => {
            acc[index + 1] = "";
            return acc;
        }, {} as { [key: number]: string })
    );

    const handleAnswered = (answer: [number, string]) => {
        setWork(prev => ({
            ...prev,
            [answer[0]]: answer[1],
        }));

    };

    if (currentIndex >= questions.length) {
        return <p>Đã hoàn thành. Kết quả:  </p>;
    }

    const handleNext = () => {
        if (currentQuestion === questions[questions.length - 1]) {
            handleFinish();
            return;
        }
        setIndex(currentIndex + 1);
    }

    const handleFinish = () => {
        const numQuestions = questions.length;
        let correctAnswers = 0;
        for (let i = 0; i < numQuestions; i++) {
            const questionNum = i + 1;
            const selectedAnswer = work[questionNum];
            if (selectedAnswer === questions[i].correctAnswer) {
                correctAnswers++;
            }
        }
        const score = (correctAnswers / numQuestions) * 10.0;

        router.push(`/dashboard/ready-to-do/result?score=${score}`)

    }

    const currentQuestion = questions[currentIndex];

    return (
        <div className="flex-1 flex items-center justify-center p-8">
            <Card className="bg-gray-800/50 border-purple-500/30 max-w-4xl w-full">
                <CardContent className="p-8">
                    <Question
                        num={currentIndex + 1}
                        question={currentQuestion.question}
                        answers={currentQuestion.answers}
                        answered={handleAnswered}
                    />

                    <div className="flex justify-end">
                        <Button
                            disabled={work[currentIndex + 1] === ""}
                            onClick={handleNext}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg pb-3.5"
                            size="lg"

                        >
                            {currentIndex === questions.length - 1 ? "Hoàn thành" : "Tiếp tục"}
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>

    );
}
