'use client';
import { RefObject, useCallback, useEffect, useState } from "react";
import Question from "./question";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { QuestionData } from "@/app/dashboard/ready-to-do/take-quiz/page";
import { useUserSettings } from "@/app/context/UserSettingContext";


interface QuizFormProps {
    currentIndex: number;
    setIndex: (index: number) => void;
    trigger: boolean;
    questions: QuestionData[]
    timeTaken: number
    onFinish: () => number;
}

export default function QuizForm({ currentIndex, setIndex, trigger, questions, timeTaken, onFinish }: QuizFormProps) {
    const { settings: userSettings, setSettings } = useUserSettings();

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

        console.log(work)

    };

    const handleNext = () => {
        if (currentQuestion === questions[questions.length - 1]) {
            playSubmitSound();
            handleFinish();
            return;
        }
        playNextSound();
        setIndex(currentIndex + 1);
    }

    const playNextSound = useCallback(() => {
        if (!userSettings?.general_settings.soundEffects) return

        const sound = new Howl({
            src: ['/next-question.mp3'],
            volume: 0.5,
        });
        sound.play();
    }, []);

    const handleFinish = async () => {
        const finalTimeTaken = await onFinish();

        const compare = {
            questions: questions,
            work: work,
            timeTaken: finalTimeTaken === 0 ? '--' : (Number(finalTimeTaken) / 1000).toFixed(1)
        }

        localStorage.setItem('compare', JSON.stringify(compare))
        router.push(`/dashboard/ready-to-do/result`)

    }

    const playSubmitSound = useCallback(() => {
        if (!userSettings?.general_settings.soundEffects) return

        const sound = new Howl({
            src: ['/submit.mp3'],
            volume: 0.5,
        });
        sound.play();
    }, []);

    if (!questions || questions.length === 0) {
        return <p>Đang tải câu hỏi...</p>;
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
