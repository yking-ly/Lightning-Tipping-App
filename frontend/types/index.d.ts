declare module 'js-cookie' {
    interface CookiesStatic {
        get(name: string): string | undefined;
        set(name: string, value: string, options?: any): void;
        remove(name: string): void;
    }

    const Cookies: CookiesStatic;
    export default Cookies;
}

declare module 'react-hot-toast' {
    export interface Toast {
        id: string;
        message: string;
    }

    export interface ToastOptions {
        duration?: number;
        position?: string;
    }

    const toast: {
        (message: string, options?: ToastOptions): string;
        success(message: string, options?: ToastOptions): string;
        error(message: string, options?: ToastOptions): string;
        loading(message: string, options?: ToastOptions): string;
    };

    export function Toaster(props: any): JSX.Element;
    export default toast;
}
