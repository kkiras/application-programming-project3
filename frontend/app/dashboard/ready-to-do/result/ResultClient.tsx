'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Home, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface QuizResult {
    score: number
    correctCount: number
    totalQuestions: number
    answers: string[]
    questions: any[]
    timeTaken: any
    // completedAt: string
}

export default function ResultClient() {
    const [result, setResult] = useState<QuizResult>()
    const [showDetails, setShowDetails] = useState(false)

    useEffect(() => {
        const compare = localStorage.getItem('compare')

        if (compare) {
            const parseCompare = JSON.parse(compare)
            console.log(parseCompare)
            const questions = parseCompare.questions
            const work = parseCompare.work

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

            const answers = Object.values(work)

            const calculation = {
                score: score as number,
                correctCount: correctAnswers as number,
                totalQuestions: questions.length as number,
                answers: answers as string[],
                questions: questions,
                timeTaken: parseCompare.timeTaken
            }

            setResult(calculation)

        }

    }, [])

    const getScoreColor = (score: number) => {
        if (score >= 8) return "text-green-400"
        if (score >= 6) return "text-yellow-400"
        return "text-red-400"
    }

    const getScoreMessage = (score: number) => {
        if (score >= 9) return "Xuất sắc! 🎉"
        if (score >= 8) return "Rất tốt! 👏"
        if (score >= 6) return "Khá tốt! 👍"
        if (score >= 4) return "Cần cố gắng thêm! 💪"
        return "Hãy ôn tập và thử lại! 📚"
    }

    return (
        <div>
            {result && (
                <div className="p-6">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-4">Kết Quả Bài Thi</h1>
                        <p className="text-xl text-purple-200">{getScoreMessage(result!.score)}</p>
                    </div>

                    <div>
                        <Card className="bg-gray-800/50 border-purple-500/30 max-w-2xl mx-auto mb-8">
                            <CardHeader className="text-center">
                                <CardTitle className="text-white text-2xl mb-4">Điểm Số</CardTitle>
                                <div className={`text-6xl font-bold ${getScoreColor(result.score)}`}>{result.score.toFixed(1)}</div>
                                <div className="text-gray-300 text-lg mt-2">
                                    {result.correctCount}/{result.totalQuestions} câu đúng
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="bg-gray-700/50 rounded-lg p-4">
                                        <div className="text-2xl font-bold text-green-400">{result.correctCount}</div>
                                        <div className="text-gray-300">Câu đúng</div>
                                    </div>
                                    <div className="bg-gray-700/50 rounded-lg p-4">
                                        <div className="text-2xl font-bold text-red-400">{result.totalQuestions - result.correctCount}</div>
                                        <div className="text-gray-300">Câu sai</div>
                                    </div>
                                    <div className="bg-gray-700/50 rounded-lg p-4">
                                        {result.timeTaken === '--' ? (<div className="text-2xl font-bold text-purple-400">{result.timeTaken}</div>)
                                            : <div className="text-2xl font-bold text-purple-400">{result.timeTaken}s</div>}
                                        <div className="text-gray-300">Thời gian</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-center space-x-4 mb-8">
                            <Link href="/">
                                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                                    <Home className="w-4 h-4" />
                                    Về trang chủ
                                </Button>
                            </Link>
                            <Link href="/quiz-setup">
                                <Button variant="outline" className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-700">
                                    <RotateCcw className="w-4 h-4" />
                                    Làm lại
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                onClick={() => setShowDetails(!showDetails)}
                                className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                                <Eye className="w-4 h-4" />
                                {showDetails ? "Ẩn chi tiết" : "Xem chi tiết"}
                            </Button>
                        </div>

                        {showDetails && (
                            <Card className="bg-gray-800/50 border-purple-500/30 max-w-4xl mx-auto">
                                <CardHeader>
                                    <CardTitle className="text-white">Chi Tiết Bài Làm</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {result.questions.map((question, index) => (
                                            <div key={index} className="border-b border-gray-700 pb-4 last:border-b-0">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h3 className="text-white font-medium flex-1">
                                                        Câu {index + 1}: {question.question}
                                                    </h3>
                                                    <Badge
                                                        variant={result.answers[index] === question.correctAnswer ? "default" : "destructive"}
                                                        className={
                                                            result.answers[index] === question.correctAnswer
                                                                ? "bg-green-600 hover:bg-green-700"
                                                                : "bg-red-600 hover:bg-red-700"
                                                        }
                                                    >
                                                        {result.answers[index] === question.correctAnswer ? "Đúng" : "Sai"}
                                                    </Badge>
                                                </div>

                                                <div className="space-y-2">
                                                    {question.answers.map((answer: string, answerIndex: number) => (
                                                        <div
                                                            key={answerIndex}
                                                            className={`p-2 rounded ${answer === question.correctAnswer
                                                                ? "bg-green-900/30 border border-green-500/50"
                                                                : answer === result.answers[index] && result.answers[index] !== question.correctAnswer
                                                                    ? "bg-red-900/30 border border-red-500/50"
                                                                    : "bg-gray-700/30"
                                                                }`}
                                                        >
                                                            <span className="text-gray-300">
                                                                {String.fromCharCode(65 + answerIndex)}. {answer}
                                                                {answer === question.correctAnswer && (
                                                                    <span className="text-green-400 ml-2">✓ Đáp án đúng</span>
                                                                )}
                                                                {answer === result.answers[index] &&
                                                                    result.answers[index] !== question.correctAnswer && (
                                                                        <span className="text-red-400 ml-2">✗ Bạn đã chọn</span>
                                                                    )}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
