/**
 * 현재 기기가 iOS인지 판별
 */
export function isIOS(): boolean {
    const ua = navigator.userAgent.toLowerCase();
    const isiOS = /iphone|ipad|ipod/.test(ua);
    const isIPadOS = /macintosh/.test(ua) && (navigator as any).maxTouchPoints > 1;
    return isiOS || isIPadOS;
}

/**
 * 현재 실행 환경이 PWA인지 판별
 */
export function isPWA(): boolean {
    return (
        (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
        (typeof (navigator as any).standalone !== "undefined" && (navigator as any).standalone)
    );
}

/**
 * PWA 설치 팝업 숨김 여부를 저장하는 localStorage 키
 * @readonly
 */
export const INSTALL_POPUP_HIDDEN_KEY = "flipflop:installPopupHidden";

/**
 * PWA 설치 팝업울 숨길지 확인
 */
export function getInstallPopupHidden(): boolean {
    return localStorage.getItem(INSTALL_POPUP_HIDDEN_KEY) === "hidden";
}

/**
 * PWA 설치 팝업을 숨기도록 설정
 */
export function setInstallPopupHidden(): void {
    localStorage.setItem(INSTALL_POPUP_HIDDEN_KEY, "hidden");
}
