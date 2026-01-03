import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';

const Layout = ({ children, role }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="app-container">
            {/* Mobile Header / Toggle */}
            {isMobile && (
                <div style={{
                    padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                    background: 'var(--bg-dark)', borderBottom: '1px solid var(--border-light)'
                }}>
                    <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                        <span className="gradient-text">GDGC</span> Portal
                    </h1>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            )}

            <Sidebar role={role} isOpen={isMobileMenuOpen} isMobile={isMobile} onClose={() => setIsMobileMenuOpen(false)} />

            <div className="main-content" style={{ marginTop: isMobile ? '60px' : '0' }}>
                <div className="animate-fade-in" style={{ width: '100%' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
