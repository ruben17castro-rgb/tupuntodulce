import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContextCore';

const ProductDetailModal = ({ product, onClose }) => {
    const { addToCart } = useCart();

    const hasPacks = Boolean(product?.hasPacks) && Array.isArray(product?.packs) && product.packs.length > 0;
    const [selectedPack, setSelectedPack] = useState(() => (hasPacks ? product.packs[0] : null));
    const [quantity, setQuantity] = useState(1);

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

    // Precio unitario por pack o precio estándar
    const currentPricePerUnit = hasPacks && selectedPack
        ? Number(selectedPack.price) || 0
        : Number(product.price) || 0;

    const totalPriceCalculated = currentPricePerUnit * quantity;

    const handleAddToCart = () => {
        if (hasPacks && selectedPack) {
            addToCart(product, quantity, {
                selectedPack: selectedPack
            });
        } else {
            addToCart(product, quantity);
        }
        onClose();
    };

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

                        {/* Display Actual Price (Updates when selecting pack) */}
                        <div style={{
                            fontSize: '1.75rem',
                            fontWeight: 'bold',
                            color: 'var(--color-primary)',
                            marginBottom: 'var(--spacing-xs)',
                            transition: 'color 0.2s ease'
                        }}>
                            {formatPrice(currentPricePerUnit)}
                            {hasPacks && selectedPack && (
                                <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500', marginLeft: '10px' }}>
                                    ({selectedPack.name})
                                </span>
                            )}
                        </div>

                        <div style={{
                            fontSize: '0.9rem',
                            color: '#888',
                            marginBottom: 'var(--spacing-md)',
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
                            fontSize: '0.95rem',
                            lineHeight: '1.5',
                            color: '#444',
                            marginBottom: 'var(--spacing-md)',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {product.description}
                        </div>

                        {/* Selector de Packs / Formatos */}
                        {hasPacks && (
                            <div style={{
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: 'var(--radius-md)',
                                padding: '12px',
                                marginBottom: '15px'
                            }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '10px' }}>
                                    Selecciona el Pack / Formato:
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {product.packs.map((packOption) => {
                                        const isSelected = selectedPack?.id === packOption.id;
                                        return (
                                            <button
                                                key={packOption.id}
                                                type="button"
                                                onClick={() => setSelectedPack(packOption)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '10px 14px',
                                                    borderRadius: 'var(--radius-sm)',
                                                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid #cbd5e1',
                                                    backgroundColor: isSelected ? '#f0f9f9' : 'white',
                                                    color: isSelected ? 'var(--color-primary)' : '#334155',
                                                    fontWeight: isSelected ? 'bold' : 'normal',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease',
                                                    textAlign: 'left'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{
                                                        width: '18px',
                                                        height: '18px',
                                                        borderRadius: '50%',
                                                        border: isSelected ? '5px solid var(--color-primary)' : '2px solid #cbd5e1',
                                                        boxSizing: 'border-box'
                                                    }} />
                                                    <span style={{ fontSize: '0.9rem' }}>{packOption.name}</span>
                                                </div>
                                                <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: isSelected ? 'var(--color-primary)' : '#0f172a' }}>
                                                    {formatPrice(packOption.price)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Stepper de Cantidad */}
                        {!isOutOfStock && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: '#f1f5f9',
                                padding: '10px 15px',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '15px'
                            }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>
                                    Cantidad {hasPacks && selectedPack ? `de ${selectedPack.name}` : ''}:
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                        disabled={quantity <= 1}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            border: '1px solid #cbd5e1',
                                            backgroundColor: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                                            opacity: quantity <= 1 ? 0.5 : 1
                                        }}
                                    >
                                        <Minus size={16} color="#334155" />
                                    </button>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity(prev => prev + 1)}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            border: '1px solid #cbd5e1',
                                            backgroundColor: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Plus size={16} color="#334155" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleAddToCart}
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
                            {isOutOfStock ? 'Producto Agotado' : `Agregar al Carrito — ${formatPrice(totalPriceCalculated)}`}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductDetailModal;
