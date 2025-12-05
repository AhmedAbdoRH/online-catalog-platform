import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
            <h1 className="text-4xl font-bold text-brand-primary mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-4">الصفحة غير موجودة</h2>
            <p className="text-muted-foreground mb-8">
                عذرًا، لم نتمكن من العثور على الصفحة التي تبحث عنها.
            </p>
            <Link
                href="/"
                className="rounded-full bg-brand-primary px-8 py-3 text-white font-semibold hover:bg-brand-primary/90 transition-colors"
            >
                العودة للرئيسية
            </Link>
        </div>
    );
}
