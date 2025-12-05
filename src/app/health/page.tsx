export default function HealthCheck() {
    return (
        <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
            <h1>System Status: Operational</h1>
            <p>Time: {new Date().toISOString()}</p>
            <p>Environment: {process.env.NODE_ENV}</p>
        </div>
    );
}
