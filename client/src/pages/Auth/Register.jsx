import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: formData.username, password: formData.password }),
            });

            const data = await res.json();

            if (res.ok) {
                setMsg('Registration successful! Please wait for Admin approval before logging in.');
                setTimeout(() => navigate('/login'), 3000);
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
            {/* Left Side - Image/Branding */}
            {!isMobile && (
                <div style={{ flex: 1, background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '4rem', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 70% 30%, rgba(251, 188, 4, 0.1), transparent), radial-gradient(circle at 20% 80%, rgba(234, 67, 53, 0.2), transparent)', zIndex: 0 }}></div>
                    <div style={{ zIndex: 1, textAlign: 'center' }}>
                        <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                            <span className="gradient-text">GDGC</span> connect
                        </h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '500px' }}>
                            Become a member, attend events, and shape the future of tech on campus.
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
                        <h2 style={{ fontSize: '2rem' }}>Create Account</h2>
                    </div>

                    {error && (
                        <div style={{ background: 'rgba(234, 67, 53, 0.2)', color: '#ff8a80', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    {msg && (
                        <div style={{ background: 'rgba(52, 168, 83, 0.2)', color: '#81c784', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
                            {msg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Username</label>
                            <input
                                type="text"
                                placeholder="Choose a username"
                                className="input-field"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email</label>
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="input-field"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '1rem', position: 'relative' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Password</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a password"
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
                        <div style={{ marginBottom: '2rem', position: 'relative' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Confirm Password</label>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                className="input-field"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
                            Get Started
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--color-blue)', textDecoration: 'none', fontWeight: '600' }}>Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
