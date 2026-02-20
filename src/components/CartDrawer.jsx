import React from 'react';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContextCore';

const CartDrawer = () => {
    const {
        cart,
        isCartOpen,
        toggleCart,
        removeFromCart,
        updateQuantity,
        cartTotal,
        openCheckout
    } = useCart();

    if (!isCartOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={toggleCart}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 1000,
                    animation: 'fadeIn 0.3s ease'
                }}
            />

            {/* Drawer */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                maxWidth: '400px',
                backgroundColor: 'white',
                zIndex: 1001,
                boxShadow: '-5px 0 15px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideIn 0.3s ease'
            }}>
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>Tu Carrito</h2>
                    <button onClick={toggleCart} style={{ background: 'none', color: '#666' }}>
                        <X size={24} />
                    </button>
                </div>

                <div key="drawer-body" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    {cart.length === 0 ? (
                        <p key="empty-msg" style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>
                            Tu carrito está vacío. <br /> ¡Agrega algunas dulzuras!
                        </p>
                    ) : (
                        <div key="items-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {cart.map(item => (
                                <div key={`item-${item.id}`} style={{ display: 'flex', gap: '15px' }}>
                                    <img
                                        key={`img-${item.id}`}
                                        src={item.image}
                                        alt={item.name}
                                        style={{
                                            width: '70px',
                                            height: '70px',
                                            objectFit: 'cover',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <div key={`details-${item.id}`} style={{ flex: 1 }}>
                                        <h4 key={`name-${item.id}`} style={{ marginBottom: '5px', fontSize: '0.95rem' }}>{item.name}</h4>
                                        <p key={`price-${item.id}`} style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                                            ${((Number(item.price) || 0) * (Number(item.quantity) || 0)).toLocaleString('es-CL')}
                                        </p>
                                        <div key={`qty-row-${item.id}`} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            marginTop: '8px'
                                        }}>
                                            <div key={`qty-ctrl-${item.id}`} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                border: '1px solid #eee',
                                                borderRadius: '20px',
                                                padding: '2px 8px'
                                            }}>
                                                <button
                                                    key={`qty-min-${item.id}`}
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    style={{ background: 'none', color: '#666', padding: '4px' }}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span key={`qty-val-${item.id}`} style={{ margin: '0 8px', fontSize: '0.9rem' }}>{item.quantity}</span>
                                                <button
                                                    key={`qty-pls-${item.id}`}
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    style={{ background: 'none', color: '#666', padding: '4px' }}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <button
                                                key={`qty-rm-${item.id}`}
                                                onClick={() => removeFromCart(item.id)}
                                                style={{ background: 'none', color: '#ff6b6b', marginLeft: 'auto' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div key="footer-container" style={{
                    padding: '20px',
                    borderTop: '1px solid #eee',
                    backgroundColor: '#f9f9f9'
                }}>
                    <div key="total-row" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '15px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold'
                    }}>
                        <span key="total-label">Total:</span>
                        <span key="total-val">${cartTotal.toLocaleString('es-CL')}</span>
                    </div>
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={cart.length === 0}
                        onClick={openCheckout}
                    >
                        Confirmar Pedido
                    </button>
                </div>
            </div>
        </>
    );
};

export default CartDrawer;
