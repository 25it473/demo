import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user.profile?.name || '',
        bio: user.profile?.bio || '',
        contact: user.profile?.contact || ''
    });
    const navigate = useNavigate();

    // Update local state if user changes in localStorage (though unlikely without refresh)
    // Better to just fetch fresh user data on mount if we had a "get me" endpoint, 
    // but using localStorage is consistent with current app flow.

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        // Reset form data to current user data when cancelling
        if (isEditing) {
            setFormData({
                name: user.profile?.name || '',
                bio: user.profile?.bio || '',
                contact: user.profile?.contact || ''
            });
        }
    };

    const handleSave = async () => {
        // Validate Phone Number (Allows 10 digits or +CountryCode followed by 10 digits)
        const phoneRegex = /^(\+\d{1,4}[\s-]?)?\d{10}$/;
        if (formData.contact && !phoneRegex.test(formData.contact)) {
            alert('Please enter a valid phone number (10 digits or with country code like +91)');
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const updatedUser = await res.json();
                // Merge updated profile into local user object
                const newUser = { ...user, profile: updatedUser.profile };
                localStorage.setItem('user', JSON.stringify(newUser));
                setUser(newUser);
                setIsEditing(false);
            } else {
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error(error);
            alert('Error updating profile');
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>My Profile</h1>
                    <p style={{ color: 'var(--text-muted)' }}>View and update your profile information</p>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        background: 'transparent',
                        border: '1px solid var(--color-red)',
                        color: 'var(--color-red)',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                    <span style={{ fontSize: '1.2rem' }}>↳</span> Logout
                </button>
            </div>

            {/* Profile Header Card */}
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2rem', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: '#4285F4',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    color: 'white',
                    flexShrink: 0
                }}>
                    {user.username ? user.username.charAt(0).toUpperCase() : 'A'}
                </div>
                <div>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '0.2rem', fontWeight: 'bold' }}>{formData.name || user.username}</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '0.8rem' }}>{user.username}@gdgcbvm.com</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                            background: '#34A853',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                        }}>
                            Approved
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Member since 02/01/2026</span>
                    </div>
                </div>
            </div>

            {/* Profile Details Card */}
            <div className="glass-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Profile Details</h3>
                    {isEditing ? (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button onClick={handleEditToggle} className="btn-primary" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>Cancel</button>
                            <button onClick={handleSave} className="btn-primary" style={{ background: '#4285F4' }}>Save Changes</button>
                        </div>
                    ) : (
                        <button onClick={handleEditToggle} className="btn-primary" style={{ background: '#4285F4' }}>Edit Profile</button>
                    )}
                </div>

                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Update your personal information</p>

                <div style={{ marginTop: '2rem' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>👤</span>
                            <span style={{ fontWeight: '600' }}>Full Name</span>
                        </div>
                        {isEditing ? (
                            <input
                                className="input-field"
                                style={{ marginLeft: '0', width: '100%', maxWidth: '300px' }}
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        ) : (
                            <p style={{ fontSize: '1rem', marginLeft: '0' }}>{user.profile?.name || user.username}</p>
                        )}
                        <hr style={{ border: 'none', borderBottom: '1px solid var(--border-light)', margin: '1rem 0 1rem 0' }} />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>✉️</span>
                            <span style={{ fontWeight: '600' }}>Email Address</span>
                        </div>
                        <p style={{ fontSize: '1rem', marginLeft: '34px' }}>{user.username}@gdgcbvm.com</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '34px' }}>Email cannot be changed</p>
                        <hr style={{ border: 'none', borderBottom: '1px solid var(--border-light)', margin: '1rem 0 1rem 34px' }} />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>📞</span>
                            <span style={{ fontWeight: '600' }}>Phone Number</span>
                        </div>
                        {isEditing ? (
                            <input
                                className="input-field"
                                style={{ marginLeft: '0', width: '100%', maxWidth: '300px' }}
                                value={formData.contact}
                                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                placeholder="Enter phone number"
                            />
                        ) : (
                            <p style={{ fontSize: '1rem', marginLeft: '0', wordBreak: 'break-all' }}>{user.profile?.contact || 'Not provided'}</p>
                        )}
                        <hr style={{ border: 'none', borderBottom: '1px solid var(--border-light)', margin: '1rem 0 1rem 0' }} />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>📄</span>
                            <span style={{ fontWeight: '600' }}>Bio</span>
                        </div>
                        {isEditing ? (
                            <textarea
                                className="input-field"
                                rows="3"
                                style={{ marginLeft: '0', width: '100%', maxWidth: '500px' }}
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Tell us about yourself"
                            />
                        ) : (
                            <p style={{ fontSize: '1rem', marginLeft: '34px' }}>{user.profile?.bio || 'No bio provided'}</p>
                        )}
                        <hr style={{ border: 'none', borderBottom: '1px solid var(--border-light)', margin: '1rem 0 1rem 34px' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
