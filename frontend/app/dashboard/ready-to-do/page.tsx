'use client';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


export default function Page() {
    const router = useRouter();
    const questionCount = 10; // Placeholder for the number of questions
    const time = 5; // Placeholder for the time limit in seconds

    const handleStartQuiz = () => {
        router.push("/dashboard/ready-to-do/take-quiz");
    };

    return (
        <div className="flex flex-col items-center justify-center h-full text-white pb-18">
            <h1 className="text-2xl font-bold">Bạn đã sẵn sàng làm bài chưa?</h1>
            <h2>Sẽ có {questionCount} câu hỏi, trong vòng {time} phút</h2>
            <Button
                className="mt-6 bg-purple-600 text-white px-8 py-3 text-lg pb-3.5 transition duration-300 ease-out hover:-translate-y-1 hover:scale-110 hover:bg-purple-700 "
                size="lg"
                onClick={handleStartQuiz}
            >
                Bắt đầu làm bài
            </Button>
        </div>

    )
}