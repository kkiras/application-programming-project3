'use client';

import { useSearchParams } from 'next/navigation';

export default function ResultClient() {
    const searchParams = useSearchParams();
    const score = searchParams.get("score");

    return (
        <div className="text-white p-8">
            <h1 className="text-3xl font-bold mb-4">Kết quả của bạn</h1>
            <p className="text-xl">Điểm: {score} / 10</p>
        </div>
    );
}
