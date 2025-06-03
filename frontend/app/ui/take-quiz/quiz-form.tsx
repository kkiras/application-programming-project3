'use client';
import { useState } from "react";
import Question from "./question";

interface QuestionData {
    num: number;
    question: string;
    answers: string[];
    correctAnswer: string;
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

export default function QuizForm() {
    const [currentIndex, setCurrentIndex] = useState(0);

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
        setCurrentIndex(prev => prev + 1);
        if (current === questions[questions.length - 1]) {
            handleFinish();
        }
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
        alert(`You answered ${correctAnswers} out of ${numQuestions} questions correctly. Your score is ${score}`);

    }

    const current = questions[currentIndex];

    return (
        <div>
            <Question
                num={currentIndex + 1}
                question={current.question}
                answers={current.answers}
                answered={handleAnswered}
            />
            {current === questions[questions.length - 1] ? (
                <button onClick={handleNext}>Finish Quiz</button>
            ) : (
                <button onClick={handleNext}>Next</button>
            )}
        </div>

    );
}
