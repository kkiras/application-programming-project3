'use client';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAuth } from "firebase/auth";
import { BookOpen, Plus, Search, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Question {
    id: number
    question: string
    type: "single" | "multiple"
    answers: string[]
    // createdAt: string
}

export default function Page() {
    const [activeTab, setActiveTab] = useState("default")
    const [searchInput, setSearchInput] = useState("")
    const [defaultQuestions, setDefaultQuestions] = useState<Question[]>([])
    const [userQuestions, setUserQuestions] = useState<Question[]>([])
    const [selectedQuestions, setSelectedQuestions] = useState<number[]>([])

    const [currentDefaultPage, setCurrentDefaultPage] = useState(1)
    const [currentUserPage, setCurrentUserPage] = useState(1)
    const questionsPerPage = 10

    useEffect(() => {
        const getQuestion = async () => {
            const auth = getAuth();
            const user = auth.currentUser;
            const uid = user?.uid;

            try {
                const res = await fetch(`http://localhost:8000/get-questions-list?uid=${uid}`)
                const data = await res.json()
                const default_questions_data = data.default_questions
                const user_question_data = data.user_questions

                setDefaultQuestions(default_questions_data)
                setUserQuestions(user_question_data)

            } catch (err) {
                console.log(err)
            }

        }

        getQuestion()
    }, [])

    const filteredDefaultQuestions = defaultQuestions.filter((q) =>
        q.question.toLowerCase().includes(searchInput.toLowerCase())
    )

    const filteredUserQuestions = userQuestions.filter((q) =>
        q.question.toLowerCase().includes(searchInput.toLowerCase())
    )

    const totalSystemPages = Math.ceil(filteredDefaultQuestions.length / questionsPerPage)
    const startSystemIndex = (currentDefaultPage - 1) * questionsPerPage
    const endSystemIndex = startSystemIndex + questionsPerPage
    const paginatedSystemQuestions = filteredDefaultQuestions.slice(startSystemIndex, endSystemIndex)

    const totalUserPages = Math.ceil(filteredUserQuestions.length / questionsPerPage)
    const startUserIndex = (currentUserPage - 1) * questionsPerPage
    const endUserIndex = startUserIndex + questionsPerPage
    const paginatedUserQuestions = filteredUserQuestions.slice(startUserIndex, endUserIndex)

    const handleSystemPageChange = (page: number) => {
        setCurrentDefaultPage(page)
    }

    const handleUserPageChange = (page: number) => {
        setCurrentUserPage(page)
    }

    const renderPagination = (currentPage: number, totalPages: number, onPageChange: (page: number) => void) => {
        if (totalPages <= 1) return null

        const pages = []
        const maxVisiblePages = 5

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1)
        }

        // Previous button
        pages.push(
            <Button
                key="prev"
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent disabled:opacity-50"
            >
                Trước
            </Button>,
        )

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <Button
                    key={i}
                    variant={currentPage === i ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(i)}
                    className={
                        currentPage === i
                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                            : "border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                    }
                >
                    {i}
                </Button>,
            )
        }

        // Next button
        pages.push(
            <Button
                key="next"
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent disabled:opacity-50"
            >
                Sau
            </Button>,
        )

        return <div className="flex justify-center items-center space-x-2 mt-6">{pages}</div>
    }

    const getTypeColor = (length: number) => {
        return length === 4 ? "bg-blue-600" : "bg-green-600"
    }

    const getTypeLabel = (length: number) => {
        return length === 4 ? "Bốn đáp án" : "Đúng / Sai"
    }

    const handleSelectQuestion = (questionId: number) => {
        setSelectedQuestions((prev) =>
            prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId],
        )
    }

    const handleSelectAll = () => {
        if (selectedQuestions.length === filteredUserQuestions.length) {
            setSelectedQuestions([])
        } else {
            setSelectedQuestions(filteredUserQuestions.map((q) => q.id))
        }
    }

    const handleDeleteSelected = async () => {
        if (selectedQuestions.length === 0) return

        const confirmMessage = `Bạn có chắc chắn muốn xóa ${selectedQuestions.length} câu hỏi đã chọn?`
        console.log(selectedQuestions)
        if (confirm(confirmMessage)) {
            const auth = getAuth();
            const user = auth.currentUser;
            const uid = user?.uid;

            try {
                const res = await fetch('http://localhost:8000/api/delete-question', {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        uid,
                        question_ids: selectedQuestions,
                    }),
                })
                const data = await res.json()

                if (!res.ok) {
                    throw new Error(data.detail || "Xóa câu hỏi thất bại.");
                }
                console.log("✅", data.message);
                alert(data.message)

                const updatedQuestions = userQuestions.filter((q) => !selectedQuestions.includes(q.id))
                setUserQuestions(updatedQuestions)
                setSelectedQuestions([])
            } catch (error) {
                console.error("❌ Error deleting questions:", error);
            }

        }
    }


    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Danh Sách Câu Hỏi</h1>
                    <p className="text-purple-200">Xem tất cả câu hỏi trong hệ thống và câu hỏi bạn đã tạo</p>
                </div>
                <Link href="/dashboard/create-quiz">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                        <Plus className="w-4 h-4" />
                        Tạo câu hỏi mới
                    </Button>
                </Link>
            </div>

            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Tìm kiếm câu hỏi..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-10 py-5 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-6 max-w-md">
                    <TabsTrigger value="default" className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4" />
                        <span>Câu hỏi hệ thống ({defaultQuestions.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="user" className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Câu hỏi đã tạo ({userQuestions.length})</span>
                    </TabsTrigger>
                </TabsList>

                {/* Default Questions Tab */}
                <TabsContent value="default">
                    <Card className="bg-gray-800/50 border-purple-500/30">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center">
                                <BookOpen className="w-5 h-5 mr-2" />
                                Câu Hỏi Mặc Định
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {paginatedSystemQuestions.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 text-lg mb-2">Không tìm thấy câu hỏi nào</div>
                                    <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        {paginatedSystemQuestions.map((question, index) => (
                                            <div
                                                key={question.id}
                                                className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50 hover:border-purple-500/50 transition-colors"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className="text-purple-400 font-medium">#{startSystemIndex + index + 1}</span>
                                                        <p className="text-white text-lg leading-relaxed mt-2">{question.question}</p>
                                                    </div>
                                                    {question.answers && Array.isArray(question.answers) && (
                                                        <Badge
                                                            className={` ${getTypeColor(question.answers.length)} hover:${getTypeColor(question.answers.length)}`}
                                                        >
                                                            {getTypeLabel(question.answers.length)}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {renderPagination(currentDefaultPage, totalSystemPages, handleSystemPageChange)}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* User Questions Tab */}
                <TabsContent value="user">
                    <Card className="bg-gray-800/50 border-purple-500/30">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-white flex items-center">
                                    <User className="w-5 h-5 mr-2" />
                                    Câu Hỏi Đã Tạo
                                </CardTitle>
                                {filteredUserQuestions.length > 0 && (
                                    <div className="flex items-center space-x-3">
                                        {selectedQuestions.length > 0 && (
                                            <Button
                                                onClick={handleDeleteSelected}
                                                variant="destructive"
                                                size="sm"
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                Xóa ({selectedQuestions.length})
                                            </Button>
                                        )}
                                        {paginatedUserQuestions.length > 0 && (
                                            <Button
                                                onClick={handleSelectAll}
                                                variant="outline"
                                                size="sm"
                                                className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                                            >
                                                {selectedQuestions.length === filteredUserQuestions.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {paginatedUserQuestions.length === 0 ? (
                                <div className="text-center py-8">
                                    {userQuestions.length === 0 ? (
                                        <>
                                            <div className="text-gray-400 text-lg mb-2">Chưa có câu hỏi nào</div>
                                            <p className="text-gray-500 mb-4">Hãy tạo câu hỏi đầu tiên của bạn</p>
                                            <Link href="/create-question">
                                                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Tạo câu hỏi mới
                                                </Button>
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-gray-400 text-lg mb-2">Không tìm thấy câu hỏi nào</div>
                                            <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm</p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        {paginatedUserQuestions.map((question, index) => (
                                            <div
                                                key={question.id}
                                                className={`bg-gray-700/30 rounded-lg p-4 border transition-colors ${selectedQuestions.includes(question.id)
                                                    ? "border-red-500/70 bg-red-900/20"
                                                    : "border-gray-600/50 hover:border-purple-500/50"
                                                    }`}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <div className="flex items-center pt-1">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedQuestions.includes(question.id)}
                                                            onChange={() => handleSelectQuestion(question.id)}
                                                            className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <span className="text-purple-400 font-medium">#{startSystemIndex + index + 1}</span>
                                                                <p className="text-white text-lg leading-relaxed mt-2">{question.question}</p>
                                                            </div>
                                                            {question.answers && Array.isArray(question.answers) && (
                                                                <Badge
                                                                    className={` ${getTypeColor(question.answers.length)} hover:${getTypeColor(question.answers.length)}`}
                                                                >
                                                                    {getTypeLabel(question.answers.length)}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {renderPagination(currentUserPage, totalUserPages, handleUserPageChange)}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}