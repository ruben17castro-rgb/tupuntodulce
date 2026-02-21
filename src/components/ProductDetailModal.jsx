import React from 'react';
import { X, Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContextCore';

const ProductDetailModal = ({ product, onClose }) => {
    const { addToCart } = useCart();

    if (!product) return null;

    const formatPrice = (price) => {
        const val = Number(price) || 0;
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(val);
    };

    const stock = product.stock !== undefined ? Number(product.stock) : 0;
    const isOutOfStock = stock <= 0;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    zIndex: 3000,
                    backdropFilter: 'blur(4px)',
                    animation: 'fadeIn 0.3s ease'
                }}
            />

            {/* Modal */}
            <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: '800px',
                maxHeight: '90vh',
                backgroundColor: 'white',
                zIndex: 3001,
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                flexDirection: 'column',
                animation: 'modalSlideUp 0.3s ease',
                overflow: 'hidden'
            }}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        zIndex: 10,
                        background: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        color: '#666'
                    }}
                >
                    <X size={20} />
                </button>

                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    height: '100%',
                    overflowY: 'auto'
                }}>
                    {/* Image Section */}
                    <div style={{
                        flex: '1 1 400px',
                        position: 'relative',
                        backgroundColor: '#f9f9f9',
                        minHeight: '300px'
                    }}>
                        <img
                            src={product.image}
                            alt={product.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block'
                            }}
                        />
                        {isOutOfStock && (
                            <div style={{
                                position: 'absolute',
                                top: '20px',
                                left: '20px',
                                backgroundColor: '#e74c3c',
                                color: 'white',
                                padding: '8px 15px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                transform: 'rotate(-5deg)',
                                border: '2px solid white',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                            }}>
                                AGOTADO
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div style={{
                        flex: '1 1 350px',
                        padding: 'var(--spacing-xl)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}>
                        <h2 style={{
                            fontSize: '2rem',
                            color: 'var(--color-secondary)',
                            marginBottom: 'var(--spacing-sm)',
                            lineHeight: '1.2'
                        }}>
                            {product.name}
                        </h2>

                        <div style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: 'var(--color-primary)',
                            marginBottom: 'var(--spacing-md)'
                        }}>
                            {formatPrice(product.price)}
                        </div>

                        <div style={{
                            fontSize: '0.9rem',
                            color: '#888',
                            marginBottom: 'var(--spacing-lg)',
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center'
                        }}>
                            <span style={{
                                padding: '4px 12px',
                                backgroundColor: '#f0f9f9',
                                color: 'var(--color-primary)',
                                borderRadius: '20px',
                                fontWeight: '600'
                            }}>
                                {product.stock !== undefined ? `Stock: ${product.stock}` : 'Entrega Inmediata'}
                            </span>
                        </div>

                        <div style={{
                            fontSize: '1rem',
                            lineHeight: '1.6',
                            color: '#444',
                            marginBottom: 'var(--spacing-xl)',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {product.description}
                        </div>

                        <button
                            onClick={() => {
                                addToCart(product);
                                onClose();
                            }}
                            className="btn btn-primary"
                            disabled={isOutOfStock}
                            style={{
                                width: '100%',
                                padding: '15px',
                                fontSize: '1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                marginTop: 'auto',
                                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                opacity: isOutOfStock ? 0.6 : 1
                            }}
                        >
                            <ShoppingCart size={20} />
                            {isOutOfStock ? 'Producto Agotado' : 'Agregar al Carrito'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductDetailModal;
