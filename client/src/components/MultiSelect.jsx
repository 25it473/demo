import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const MultiSelect = ({ options, value, onChange, placeholder = "Select..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const toggleOption = (optionId) => {
        const newValue = value.includes(optionId)
            ? value.filter(id => id !== optionId)
            : [...value, optionId];
        onChange(newValue);
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', flex: 1 }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="input-field"
                style={{
                    marginBottom: '0',
                    padding: '8px',
                    fontSize: '0.9rem',
                    background: 'var(--bg-dark)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                }}
            >
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {value.length > 0
                        ? `${value.length} selected`
                        : placeholder
                    }
                </span>
                <ChevronDown size={14} />
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    background: '#1e1e1e',
                    border: '1px solid var(--border-light)',
                    borderRadius: '8px',
                    marginTop: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.8)'
                }}>
                    {options.map(option => (
                        <div
                            key={option.value}
                            onClick={() => toggleOption(option.value)}
                            style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                background: value.includes(option.value) ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
                            }}
                        >
                            <div style={{
                                width: '16px',
                                height: '16px',
                                border: '1px solid var(--text-muted)',
                                borderRadius: '4px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                background: value.includes(option.value) ? 'var(--color-blue)' : 'transparent',
                                borderColor: value.includes(option.value) ? 'var(--color-blue)' : 'var(--text-muted)'
                            }}>
                                {value.includes(option.value) && <Check size={12} color="white" />}
                            </div>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{option.label}</span>
                        </div>
                    ))}
                    {options.length === 0 && (
                        <div style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No options</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MultiSelect;
