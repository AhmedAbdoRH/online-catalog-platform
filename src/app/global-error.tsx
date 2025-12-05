'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    padding: '20px',
                    fontFamily: 'system-ui, sans-serif',
                    textAlign: 'center'
                }}>
                    <h2 style={{ fontSize: '24px', marginBottom: '16px', fontWeight: 'bold' }}>
                        عذراً، حدث خطأ جسيم في الخادم
                    </h2>
                    <p style={{ color: '#666', marginBottom: '20px' }}>
                        {error.message || 'خطأ غير متوقع'}
                    </p>
                    <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', marginBottom: '20px', textAlign: 'left', direction: 'ltr' }}>
                        <small>Digest: {error.digest}</small>
                    </div>
                    <button
                        onClick={() => reset()}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#000',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        حاول مرة أخرى
                    </button>
                </div>
            </body>
        </html>
    );
}
