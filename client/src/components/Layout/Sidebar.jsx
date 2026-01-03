import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, LogOut, PlusCircle, MessageSquare, User } from 'lucide-react';

const Sidebar = ({ role, isOpen, isMobile, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const linkStyle = (path) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '8px',
        textDecoration: 'none',
        color: isActive(path) ? 'white' : '#94a3b8',
        background: isActive(path) ? 'var(--color-blue)' : 'transparent',
        fontWeight: isActive(path) ? '500' : 'normal',
        transition: 'all 0.2s ease',
    });

    const sidebarStyle = {
        width: '250px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '0',
        transition: 'transform 0.3s ease-in-out',
        ...(isMobile ? {
            position: 'fixed',
            top: '60px', // Below header
            left: 0,
            bottom: 0,
            zIndex: 90,
            transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
            height: 'calc(100vh - 60px)',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)'
        } : {
            position: 'relative',
            transform: 'none'
        })
    };

    const handleLinkClick = () => {
        if (isMobile && onClose) onClose();
    };

    return (
        <div className={!isMobile ? "glass-card" : ""} style={sidebarStyle}>
            {!isMobile && (
                <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-light)' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        <span className="gradient-text">GDGC</span> Portal
                    </h1>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{role === 'admin' ? 'Admin Panel' : 'Team Portal'}</p>
                </div>
            )}

            <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                {role === 'admin' ? (
                    <>
                        <Link to="/admin" style={linkStyle('/admin')} onClick={handleLinkClick}>
                            <Home size={20} /> Admin Dashboard
                        </Link>
                        <Link to="/admin/users" style={linkStyle('/admin/users')} onClick={handleLinkClick}>
                            <Users size={20} /> Pending Users
                        </Link>
                        <Link to="/admin/requests" style={linkStyle('/admin/requests')} onClick={handleLinkClick}>
                            <MessageSquare size={20} /> Proposals
                        </Link>
                        <Link to="/member/events" style={linkStyle('/member/events')} onClick={handleLinkClick}>
                            <Calendar size={20} /> Events
                        </Link>
                        <Link to="/team" style={linkStyle('/team')} onClick={handleLinkClick}>
                            <Users size={20} /> Team
                        </Link>
                        <Link to="/member/profile" style={linkStyle('/member/profile')} onClick={handleLinkClick}>
                            <User size={20} /> Profile
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/member" style={linkStyle('/member')} onClick={handleLinkClick}>
                            <Home size={20} /> Member Dashboard
                        </Link>
                        <Link to="/member/events" style={linkStyle('/member/events')} onClick={handleLinkClick}>
                            <Calendar size={20} /> Events
                        </Link>
                        <Link to="/member/community" style={linkStyle('/member/community')} onClick={handleLinkClick}>
                            <MessageSquare size={20} /> Proposals
                        </Link>
                        <Link to="/team" style={linkStyle('/team')} onClick={handleLinkClick}>
                            <Users size={20} /> Team
                        </Link>
                        <Link to="/member/profile" style={linkStyle('/member/profile')} onClick={handleLinkClick}>
                            <User size={20} /> Profile
                        </Link>
                    </>
                )}
            </nav>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-light)' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-red)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        width: '100%',
                        padding: '12px'
                    }}>
                    <LogOut size={20} /> Logout
                </button>
            </div>
        </div >
    );
};

export default Sidebar;
