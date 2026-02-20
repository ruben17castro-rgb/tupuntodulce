import React from 'react';
import { useProducts } from '../context/ProductContextCore';
import ProductCard from '../components/ProductCard';
import logo from '../assets/logo.png';
import alfajorImg from '../assets/alfajor.jpeg';
import rollitosImg from '../assets/rollitos.jpeg';
import galletasImg from '../assets/galletas.png';
import galletas4Img from '../assets/galletas 4.png';
import galletas5Img from '../assets/galletas 5.png';

const Home = () => {
    const { products, loading } = useProducts();

    return (
        <div>
            {/* Hero Section */}
            {/* Hero Section */}
            <section style={{
                textAlign: 'center',
                paddingTop: 'var(--spacing-xl)',
                paddingBottom: 'var(--spacing-xxl)',
                backgroundColor: '#F9F7F2', /* Beige/Cream color */
                borderBottom: '1px solid #EAE0D5'
            }}>
                <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Logo & Brand */}
                    <img
                        src={logo}
                        alt="Tu Punto Dulce Logo"
                        style={{
                            width: '80px',
                            height: '80px',
                            marginBottom: 'var(--spacing-sm)',
                            borderRadius: '50%',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                        }}
                    />

                    <h1 style={{
                        fontSize: '3.5rem',
                        color: 'var(--color-secondary)',
                        marginBottom: '0',
                        letterSpacing: '-1px',
                        lineHeight: '1.1'
                    }}>
                        Tu Punto Dulce
                    </h1>

                    <div style={{ marginBottom: 'var(--spacing-xl)', marginTop: 'var(--spacing-xs)' }}>
                        <p style={{
                            fontSize: '0.9rem',
                            color: '#333',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            marginBottom: 'var(--spacing-xs)'
                        }}>
                            Gracias por visitarnos
                        </p>
                        <h2 style={{
                            fontSize: '2.5rem',
                            color: 'var(--color-secondary)',
                            fontWeight: '600',
                            margin: 0,
                            lineHeight: '1.2'
                        }}>
                            ¿Qué deseas pedir?
                        </h2>
                    </div>

                    {/* CTA Button */}
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
                        }}
                        style={{
                            padding: '12px 32px',
                            fontSize: '1.1rem',
                            boxShadow: '0 10px 20px rgba(78, 205, 196, 0.3)',
                            marginBottom: 'var(--spacing-xl)'
                        }}
                    >
                        Haz tu pedido ahora
                    </button>

                    {/* Hero Image (Placeholder until generation works) */}
                    {/* Animated Hero Images */}
                    {/* Animated Hero Images Slider */}
                    <div style={{
                        width: '100%',
                        overflow: 'hidden',
                        marginTop: 'var(--spacing-md)',
                        padding: '20px 0',
                    }}>
                        <style>
                            {`
                                @keyframes slide {
                                    from { transform: translateX(0); }
                                    to { transform: translateX(-50%); }
                                }
                                
                                .slider-wrapper {
                                    display: flex;
                                    width: max-content;
                                    animation: slide 30s linear infinite;
                                    gap: 20px;
                                    align-items: center;
                                }

                                .slider-img {
                                    width: 250px;
                                    height: 250px;
                                    object-fit: cover;
                                    border-radius: var(--radius-lg);
                                    box-shadow: var(--shadow-lg);
                                    flex-shrink: 0;
                                }

                                @media (max-width: 768px) {
                                    .slider-img {
                                        width: 180px;
                                        height: 180px;
                                    }
                                    .slider-wrapper {
                                        animation-duration: 20s;
                                        gap: 15px;
                                    }
                                }
                            `}
                        </style>
                        <div className="slider-wrapper">
                            {/* Original Set */}
                            <img src={rollitosImg} alt="Rollitos de Canela" className="slider-img" />
                            <img src={alfajorImg} alt="Alfajor Artesanal" className="slider-img" />
                            <img src={galletasImg} alt="Galletas Decoradas" className="slider-img" />
                            <img src={galletas4Img} alt="Galletas 4" className="slider-img" />
                            <img src={galletas5Img} alt="Galletas 5" className="slider-img" />

                            {/* Duplicate Set for Seamless Loop */}
                            <img src={rollitosImg} alt="Rollitos de Canela" className="slider-img" />
                            <img src={alfajorImg} alt="Alfajor Artesanal" className="slider-img" />
                            <img src={galletasImg} alt="Galletas Decoradas" className="slider-img" />
                            <img src={galletas4Img} alt="Galletas 4" className="slider-img" />
                            <img src={galletas5Img} alt="Galletas 5" className="slider-img" />

                            {/* Triplicate Set for wider screens */}
                            <img src={rollitosImg} alt="Rollitos de Canela" className="slider-img" />
                            <img src={alfajorImg} alt="Alfajor Artesanal" className="slider-img" />
                            <img src={galletasImg} alt="Galletas Decoradas" className="slider-img" />
                            <img src={galletas4Img} alt="Galletas 4" className="slider-img" />
                            <img src={galletas5Img} alt="Galletas 5" className="slider-img" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Catalog Section */}
            <section id="catalog" style={{ padding: 'var(--spacing-xxl) 0' }}>
                <div className="container">
                    <h2 className="section-title">Nuestras Delicias</h2>

                    {loading ? (
                        <p style={{ textAlign: 'center' }}>Cargando dulzura...</p>
                    ) : (
                        <div className="products-grid">
                            {(Array.isArray(products) ? products : [])
                                .filter(p => p && p.id && p.active)
                                .map(product => (
                                    <ProductCard key={String(product.id)} product={product} />
                                ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;
