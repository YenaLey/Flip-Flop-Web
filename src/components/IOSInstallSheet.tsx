"use client";

export default function IOSInstallSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end">
            <div className="w-full bg-white rounded-t-3xl p-5">
                <div className="font-semibold mb-2">iOS 설치</div>
                <ol className="text-sm list-decimal list-inside space-y-1">
                    <li>Safari로 열기</li>
                    <li>공유 버튼 탭</li>
                    <li>"홈 화면에 추가" 선택</li>
                </ol>
                <div className="flex justify-end mt-3">
                    <button onClick={onClose} className="rounded-xl px-3 py-2 border">
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}
