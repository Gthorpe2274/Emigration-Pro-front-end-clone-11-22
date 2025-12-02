import React, { useState, useEffect } from 'react';

interface ProtectedEmailProps {
    user?: string;
    domain?: string;
    className?: string;
    label?: string;
}

/**
 * ProtectedEmail Component
 * 
 * Prevents email scraping by:
 * 1. Not having the email in the initial HTML source
 * 2. Assembling the mailto link only on interaction/mount
 * 3. Using simple obfuscation for the parts
 */
export const ProtectedEmail: React.FC<ProtectedEmailProps> = ({
    user = 'info',
    domain = 'emigrationpro.com',
    className = '',
    label
}) => {
    const [email, setEmail] = useState<string>('');

    // Assemble email only after hydration/mount to hide from basic scrapers
    useEffect(() => {
        // Small delay to ensure we're past initial render
        const timer = setTimeout(() => {
            setEmail(`${user}@${domain}`);
        }, 50);
        return () => clearTimeout(timer);
    }, [user, domain]);

    const handleClick = (e: React.MouseEvent) => {
        if (!email) {
            e.preventDefault();
            window.location.href = `mailto:${user}@${domain}`;
        }
    };

    if (!email) {
        // Render a placeholder that looks like the email but isn't a link yet
        // or use a skeleton/loading state if preferred.
        // Here we render the label or a safe approximation to prevent layout shift
        return (
            <span className={className} aria-label="Email address">
                {label || 'Loading contact info...'}
            </span>
        );
    }

    return (
        <a
            href={`mailto:${email}`}
            className={className}
            onClick={handleClick}
        >
            {label || email}
        </a>
    );
};
