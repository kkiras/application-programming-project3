'use client';

import clsx from "clsx";
import { useState, useEffect } from "react";

interface QuestionProps {
    num: number;
    question: string;
    answers: string[];
    answered: (result: [number, string]) => void;
}

export default function Question({ num, question, answers, answered }: QuestionProps) {
    useEffect(() => {
        setSelectedAnswer(-1);
    }, [num]);

    const [selectedAnswer, setSelectedAnswer] = useState(-1);
    const handleAnswerSelected = (index: number) => {
        setSelectedAnswer(index);
        answered([num, answers[index]]);
    }

    return (
        <div >
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">
                    Câu {num}: {question}
                </h2>
            </div>

            <div className="space-y-4 mb-8">
                {answers.map((ans, index) => (
                    <button
                        key={index}
                        onClick={() => handleAnswerSelected(index)}
                        className={clsx(
                            'w-full p-4 text-left rounded-lg border-2 transition-all',
                            selectedAnswer === index
                                ? "border-purple-500 bg-purple-600/20 text-white"
                                : "border-gray-600 bg-gray-700/50 text-gray-300 hover:border-purple-400 hover:bg-gray-600/50"
                        )}
                    >
                        <div className="flex items-center">
                            <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center mr-4 text-sm font-bold">
                                {["A", "B", "C", "D"][index] ?? "Unknown"}
                            </span>
                            <span className="text-lg">
                                {ans}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}