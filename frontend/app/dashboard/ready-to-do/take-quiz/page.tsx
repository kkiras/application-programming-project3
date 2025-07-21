'use client';
import { useUserSettings } from "@/app/context/UserSettingContext";
import QuizForm from "@/app/ui/take-quiz/quiz-form"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import clsx from "clsx"
import { getAuth } from "firebase/auth";
import { X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export interface QuestionData {
    num: number;
    question: string;
    answers: string[];
    correctAnswer: string;
}

export default function Page() {
    const defaultTimeLeft = 20;
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [questionTimeLeft, setQuestionTimeLeft] = useState(defaultTimeLeft);
    const [trigger, setTrigger] = useState(false);
    const [questions, setQuestions] = useState<QuestionData[]>([])
    const { settings: userSettings, setSettings } = useUserSettings();
    const [timeTaken, setTimeTaken] = useState(0);
    const startTimeRef = useRef<number>(Date.now());

    useEffect(() => {
        const getQuestion = async () => {
            const count = userSettings?.general_settings.questionCount
            const auth = getAuth();
            const user = auth.currentUser;
            const uid = user?.uid;

            if (!count) return

            try {
                const res = await fetch(`http://localhost:8000/get-questions/${count}?uid=${uid}`)
                const data = await res.json()
                const questions_data = data.questions
                setQuestions(questions_data)
            } catch (err) {
                console.log(err)
            }

        }

        getQuestion()
    }, [])


    useEffect(() => {
        if (!userSettings?.general_settings.questionTimer) return;

        console.log("Câu hỏi mới:", currentQuestion + 1);
        startTimeRef.current = Date.now();

        const questionTimer = setInterval(() => {
            setQuestionTimeLeft(prev => {
                if (prev <= 0) {
                    setTrigger(true);
                    clearInterval(questionTimer);
                    setTimeout(() => setTrigger(false), 100);
                    return defaultTimeLeft;
                }
                return prev - 1;
            });
        }, 1000)
        return () => {
            clearInterval(questionTimer)
            const elapsed = Date.now() - startTimeRef.current;
            setTimeTaken(prev => prev + elapsed);
            setQuestionTimeLeft(defaultTimeLeft);
        };
    }, [currentQuestion]);

    const setIndex = (index: number) => {
        setCurrentQuestion(index);

    }

    const handleFinishQuiz = () => {
        if (!userSettings?.general_settings.questionTimer) return 0;
        const elapsed = Date.now() - startTimeRef.current;
        const total = timeTaken + elapsed;
        setTimeTaken(total);
        return total;
    };

    const progress = ((currentQuestion + 1) / questions.length) * 100

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 flex flex-col">
            <div className="bg-gray-800/70 border-b border-purple-500/30 p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center max-6xl mx-auto">
                    <div className="flex items-center space-x-6">
                        <div className="text-white">
                            <span className="text-sm text-gray-300">Câu hỏi</span>
                            <div className="text-xl font-bold">
                                {currentQuestion + 1}/{questions.length}
                            </div>
                        </div>
                        <div className="w-48">
                            <Progress value={progress} className="h-2 bg-white" />
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        {/* <div>
                            <span className="text-sm text-gray-300">Thời gian còn lại</span>
                            <div>
                            </div>
                        </div> */}
                        <div className="text-center">
                            <span className="text-sm text-gray-300">Thời gian câu hỏi</span>
                            {userSettings?.general_settings.questionTimer === true ? (
                                <div
                                    className={clsx(
                                        'text-xl font-bold',
                                        questionTimeLeft <= 10 ? 'text-red-400' : 'text-purple-400'
                                    )}
                                >
                                    {questionTimeLeft}s
                                </div>
                            ) : (
                                <div className='text-xl font-bold text-yellow-400'>
                                    --
                                </div>
                            )}

                        </div>
                        <Button
                            variant="ghost"
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                            <X className="w-5 h-5" />
                            Thoát
                        </Button>

                    </div>
                </div>
            </div>

            <QuizForm
                trigger={trigger}
                currentIndex={currentQuestion}
                setIndex={setIndex}
                questions={questions}
                timeTaken={timeTaken}
                onFinish={handleFinishQuiz}
            />

        </div>

    )
}