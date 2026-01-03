import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));
                if (data.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/member');
                }
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Something went wrong. Is the server running?');
        }
    };

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useState(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflowX: 'hidden', flexDirection: isMobile ? 'column' : 'row' }}>
            {/* Left Side - Image/Branding - Hidden on very small screens or stacked */}
            {!isMobile && (
                <div style={{ flex: 1, background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '4rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 30% 30%, rgba(66, 133, 244, 0.2), transparent), radial-gradient(circle at 70% 70%, rgba(52, 168, 83, 0.2), transparent)', zIndex: 0 }}></div>
                    <div style={{ zIndex: 1, textAlign: 'center' }}>
                        <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                            <span className="gradient-text">GDGC</span> Portal
                        </h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '500px' }}>
                            Manage events, collaborate with developers, and grow your community at BVM Engineering College.
                        </p>
                    </div>
                </div>
            )}

            {/* Right Side - Form */}
            <div style={{
                flex: isMobile ? '1' : '0 0 500px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'var(--bg-dark)',
                padding: '2rem',
                borderLeft: !isMobile ? '1px solid var(--border-light)' : 'none',
                width: '100%'
            }}>
                <div className="animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        {isMobile && (
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', display: 'block' }}>
                                <span className="gradient-text">GDGC</span> Portal
                            </h1>
                        )}
                        <h2 style={{ fontSize: '2rem' }}>Welcome Back</h2>
                    </div>

                    {error && (
                        <div style={{ background: 'rgba(234, 67, 53, 0.2)', color: '#ff8a80', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Username</label>
                            <input
                                type="text"
                                placeholder="Enter your username"
                                className="input-field"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '2rem', position: 'relative' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className="input-field"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '38px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer'
                                }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
                            Sign In
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
                        Don't have an account? <Link to="/register" style={{ color: 'var(--color-blue)', textDecoration: 'none', fontWeight: '600' }}>Register here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
