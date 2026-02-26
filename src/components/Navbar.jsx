import React from 'react';
import { ShoppingBag, Menu } from 'lucide-react';
import { useCart } from '../context/CartContextCore';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const { toggleCart, cartCount } = useCart();

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
                {/* Logo Area */}
                <Link to="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.8rem',
                    fontWeight: '400', /* Pacifico looks better without bold */
                    color: 'var(--color-primary-dark)',
                    textShadow: '1px 1px 0px rgba(255,255,255,0.5)'
                }}>
                    <span>Tu Punto Dulce</span>
                </Link>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <button
                        onClick={toggleCart}
                        style={{
                            position: 'relative',
                            background: 'white',
                            border: '1px solid rgba(212, 163, 115, 0.3)',
                            color: 'var(--color-secondary)',
                            padding: '10px',
                            borderRadius: '50%',
                            boxShadow: 'var(--shadow-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'var(--transition)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                        }}
                    >
                        <ShoppingBag size={22} />
                        {cartCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-4px',
                                right: '-4px',
                                backgroundColor: 'var(--color-accent)', /* Terracotta */
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
                                boxShadow: '0 2px 4px rgba(226, 149, 120, 0.4)',
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
