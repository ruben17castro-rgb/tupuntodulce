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
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
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
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'var(--color-primary)'
                }}>
                    <span>Tu Punto Dulce</span>
                </Link>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <button
                        onClick={toggleCart}
                        style={{
                            position: 'relative',
                            background: 'none',
                            color: 'var(--color-secondary)',
                            padding: '8px'
                        }}
                    >
                        <ShoppingBag size={24} />
                        {cartCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
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
