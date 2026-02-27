import React from 'react';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContextCore';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars

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

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="cart-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleCart}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            zIndex: 1000
                        }}
                    />

                    {/* Drawer */}
                    <motion.div
                        key="cart-drawer"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
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
                            flexDirection: 'column'
                        }}
                    >
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
                                <motion.p
                                    key="empty-msg"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}
                                >
                                    Tu carrito está vacío. <br /> ¡Agrega algunas dulzuras!
                                </motion.p>
                            ) : (
                                <div key="items-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <AnimatePresence mode="popLayout">
                                        {cart.map(item => (
                                            <motion.div
                                                key={`item-${item.id}`}
                                                layout
                                                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, x: 20 }}
                                                transition={{ duration: 0.2 }}
                                                style={{ display: 'flex', gap: '15px' }}
                                            >
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
                                                                disabled={item.stock !== undefined && item.quantity >= item.stock}
                                                                style={{ background: 'none', color: '#666', padding: '4px', opacity: (item.stock !== undefined && item.quantity >= item.stock) ? 0.5 : 1 }}
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
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
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
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
