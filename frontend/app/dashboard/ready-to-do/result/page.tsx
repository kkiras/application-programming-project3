import { Suspense } from 'react';
import ResultClient from './ResultClient';

export default function ResultPageWrapper() {
    return (
        <Suspense fallback={<div className="text-white">Đang tải kết quả...</div>}>
            <ResultClient />
        </Suspense>
    );
}
