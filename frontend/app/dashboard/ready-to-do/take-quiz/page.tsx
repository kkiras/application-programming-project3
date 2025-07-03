import QuizForm from "@/app/ui/take-quiz/quiz-form"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { X } from "lucide-react"

export default function Page() {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 flex flex-col">
            {/* Header */}
            <div className="bg-gray-800/70 border-b border-purple-500/30 p-4 backdrop-blur-sm">
                <div className="flex justify-between items-center max-6xl mx-auto">
                    <div className="flex items-center space-x-6">
                        <div className="text-white">
                            <span className="text-sm text-gray-300">Câu hỏi</span>
                            <div className="text-xl font-bold">
                                {/* Placeholder for question count */}
                                1/10
                            </div>
                        </div>
                        <div className="w-48">
                            <Progress className="h-2 bg-white" />
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div>
                            <span className="text-sm text-gray-300">Thời gian còn lại</span>
                            <div>
                                {/* Placeholder for timer */}
                            </div>
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

            <QuizForm />

        </div>

    )
}