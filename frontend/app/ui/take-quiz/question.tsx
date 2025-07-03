'use client';

import { useState, useEffect } from "react";

interface QuestionProps {
    num: number;
    question: string;
    answers: string[];
    answered: (result: [number, string]) => void;
}

export default function Question({ num, question, answers, answered }: QuestionProps) {
    useEffect(() => {
        setSelectedAnswer("");
    }, [num]);

    const [selectedAnswer, setSelectedAnswer] = useState("");
    const onAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSelectedAnswer(value);
        answered([num, value]);
    }

    return (
        <div>
            <div>
                <p>Câu {num}: </p>
                <p>{question}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
                {answers.map((item: string, index: number) => (
                    <label key={index}>
                        <input type="radio" name={`question-${num}`} value={item} onChange={onAnswerChange} checked={selectedAnswer === item} />
                        {item}
                    </label>
                ))}
            </div>
            <p>Selected: {selectedAnswer}</p>
        </div>
    )
}