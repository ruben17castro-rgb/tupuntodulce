import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu } from 'lucide-react';
import { useCart } from '../context/CartContextCore';
import { Link, useLocation } from 'react-router-dom';

const slogans = [
    "¡Horneamos momentos que se quedan en el corazón!",
    "Elaborado con amor y los mejores ingredientes",
    "El toque dulce que tu día necesita"
];

const Navbar = () => {
    const { toggleCart, cartCount } = useCart();
    const [currentSloganIndex, setCurrentSloganIndex] = useState(0);
    const [fade, setFade] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false); // Start fading out
            setTimeout(() => {
                setCurrentSloganIndex((prev) => (prev + 1) % slogans.length);
                setFade(true); // Fade back in with new text
            }, 1000); // Wait 1s (duration of fade out) before changing text
        }, 5000); // Change slogan every 5 seconds (slowly)

        return () => clearInterval(interval);
    }, []);

    // Prevent rendering Navbar on admin routes
    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <nav style={{
            padding: 'var(--spacing-md) 0',
            position: 'sticky',
            top: 0,
            backgroundColor: 'rgba(249, 247, 242, 0.85)', /* Match new warm bg */
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(212, 163, 115, 0.2)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            zIndex: 100
        }}>
            <div className="container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                {/* Slogan Area */}
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, paddingRight: '10px' }}>
                    <style>
                        {`
                        .nav-slogan {
                            font-family: 'Sora', sans-serif;
                            font-style: normal;
                            font-weight: 500;
                            font-size: 1.15rem; /* Increased size */
                            color: var(--color-secondary);
                            line-height: 1.3;
                            margin: 0;
                            transition: opacity 1s ease-in-out;
                        }
                        @media (max-width: 600px) {
                            .nav-slogan {
                                font-size: 0.85rem; /* Increased size for mobile */
                                letter-spacing: 0;
                            }
                        }
                        `}
                    </style>
                    <Link to="/" style={{ textDecoration: 'none', maxWidth: '100%', overflow: 'hidden' }}>
                        <div className="nav-slogan-wrapper" style={{ overflow: 'hidden' }}>
                            <p className="nav-slogan" style={{ opacity: fade ? 1 : 0 }}>
                                {slogans[currentSloganIndex]}
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <button
                        onClick={toggleCart}
                        style={{
                            position: 'relative',
                            background: 'var(--color-primary)',
                            border: 'none',
                            color: 'white',
                            padding: '10px',
                            borderRadius: '50%',
                            boxShadow: '0 4px 10px rgba(83, 166, 156, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'var(--transition)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 15px rgba(83, 166, 156, 0.5)';
                            e.currentTarget.style.background = 'var(--color-primary-dark)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 10px rgba(83, 166, 156, 0.4)';
                            e.currentTarget.style.background = 'var(--color-primary)';
                        }}
                    >
                        <ShoppingBag size={22} />
                        {cartCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-4px',
                                right: '-4px',
                                backgroundColor: 'var(--color-primary)', /* Match buttons */
                                color: 'white',
                                borderRadius: '50%',
                                minWidth: '22px',
                                height: '22px',
                                padding: '0 4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                boxShadow: '0 2px 4px rgba(83, 166, 156, 0.4)', /* Adjusted shadow color slightly for mint */
                                border: '2px solid white'
                            }}>
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
