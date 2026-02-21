import React from 'react';
import { useCart } from '../context/CartContextCore';
import { Plus } from 'lucide-react';

const ProductCard = ({ product, onSelect }) => {
    const { addToCart } = useCart();

    const formatPrice = (price) => {
        const val = Number(price) || 0;
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(val);
    };

    const stock = product?.stock !== undefined ? Number(product.stock) : 0;
    const isOutOfStock = stock <= 0;
    const productId = String(product?.id || 'unknown');

    return (
        <div
            key={`card-${productId}`}
            className="product-card"
            onClick={onSelect}
            style={{
                backgroundColor: 'white',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
                transition: 'var(--transition)',
                border: '1px solid rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer'
            }}
        >
            <div key={`img-container-${productId}`} style={{
                position: 'relative',
                paddingTop: '100%',
                overflow: 'hidden'
            }}>
                <img
                    key={`img-${productId}`}
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                    }}
                />
                {isOutOfStock && (
                    <div key={`badge-container-${productId}`} style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10
                    }}>
                        <span key={`badge-${productId}`} style={{
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            transform: 'rotate(-10deg)',
                            border: '2px solid white',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                        }}>
                            AGOTADO
                        </span>
                    </div>
                )}
            </div>

            <div
                key={`body-${productId}`}
                className="product-card-body"
                style={{ padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', flex: 1 }}
            >
                <h3
                    key={`title-${productId}`}
                    className="product-card-title"
                    style={{
                        fontSize: '1.2rem',
                        marginBottom: 'var(--spacing-xs)',
                        fontFamily: 'var(--font-body)',
                        fontWeight: 600
                    }}
                >
                    {product.name}
                </h3>

                <p key={`desc-${productId}`} style={{
                    fontSize: '0.9rem',
                    color: '#666',
                    marginBottom: 'var(--spacing-md)',
                    lineHeight: '1.4',
                    height: '2.8em',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                }}>
                    {product.description}
                </p>

                <div key={`stock-${productId}`} style={{ marginBottom: '10px', fontSize: '0.8rem', color: '#888', marginTop: 'auto' }}>
                    {product.stock !== undefined ? `Stock: ${product.stock}` : 'Stock: Ilimitado'}
                </div>

                <div key={`footer-${productId}`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px'
                }}>
                    <span
                        key={`price-${productId}`}
                        className="product-card-price"
                        style={{
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            color: 'var(--color-primary)'
                        }}
                    >
                        {formatPrice(product.price)}
                    </span>

                    <button
                        key={`btn-${productId}`}
                        onClick={(e) => {
                            e.stopPropagation(); // Prevents modal from opening when clicking the button
                            addToCart(product);
                        }}
                        className="btn btn-primary"
                        disabled={isOutOfStock}
                        style={{
                            padding: '8px 12px',
                            fontSize: '0.85rem',
                            display: 'flex',
                            gap: '4px',
                            backgroundColor: isOutOfStock ? '#ccc' : 'var(--color-primary)',
                            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                            border: 'none',
                            color: 'white',
                            borderRadius: '20px'
                        }}
                    >
                        {isOutOfStock ? (
                            <span key={`label-out-${productId}`}>Agotado</span>
                        ) : (
                            <span key={`label-add-${productId}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Plus size={14} />
                                Agregar
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};



export default ProductCard;
