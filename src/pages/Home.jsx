import React, { useEffect, useState } from 'react';
import { useProducts } from '../context/ProductContextCore';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import { incrementPageViewsFirebase } from '../services/firebaseService';
import logo from '../assets/logo.png';
import alfajorImg from '../assets/alfajor.jpeg';
import rollitosImg from '../assets/rollitos.jpeg';
import galletasImg from '../assets/galletas.png';
import galletas4Img from '../assets/galletas 4.png';
import galletas5Img from '../assets/galletas 5.png';
import bgHero from '../assets/galletas matrimonio.png'; /* NEW IMAGE IMPORT */

const Home = () => {
    const { products, loading } = useProducts();
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Track page views once per session
    useEffect(() => {
        const hasVisited = sessionStorage.getItem('hasVisitedTPD');
        if (!hasVisited) {
            incrementPageViewsFirebase();
            sessionStorage.setItem('hasVisitedTPD', 'true');
        }
    }, []);

    return (
        <div>
            {/* Hero Section */}
            {/* Hero Section */}
            <section style={{
                position: 'relative',
                textAlign: 'center',
                paddingTop: 'var(--spacing-xxl)',
                paddingBottom: 'var(--spacing-xxl)',
                backgroundImage: `url(${bgHero})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                overflow: 'hidden'
            }}>
                {/* Dark overlay for readability */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to bottom, rgba(74, 59, 50, 0.7) 0%, rgba(74, 59, 50, 0.7) 80%, var(--color-bg) 100%)',
                    zIndex: 1
                }}></div>

                <div className="container" style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Logo & Brand */}
                    <img
                        src={logo}
                        alt="Tu Punto Dulce Logo"
                        style={{
                            width: '180px', /* Increased base size to compensate for cropping */
                            height: '180px',
                            marginBottom: 'var(--spacing-md)',
                            borderRadius: '50%',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                            objectFit: 'cover',
                            clipPath: 'circle(37% at 50% 50%)', /* Tighter crop to only show the inner circle */
                            transform: 'scale(1.2)' /* Scale up slightly to offset the heavy clipping */
                        }}
                    />

                    <h1 style={{
                        fontSize: '3.5rem', /* Adjusted for McLaren */
                        fontFamily: "'McLaren', sans-serif",
                        fontWeight: '400',
                        color: 'white',
                        marginBottom: '0',
                        letterSpacing: '2px',
                        lineHeight: '1.2',
                        textShadow: '2px 4px 10px rgba(0,0,0,0.5)',
                    }}>
                        Tu Punto Dulce
                    </h1>

                    <div style={{ marginBottom: 'var(--spacing-xl)', marginTop: 'var(--spacing-xs)' }}>
                        <p style={{
                            fontSize: '1rem',
                            color: 'white',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '3px',
                            marginBottom: 'var(--spacing-sm)',
                            textShadow: '1px 2px 4px rgba(0,0,0,0.5)',
                        }}>
                            Gracias por visitarnos
                        </p>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
                        }}
                        style={{
                            padding: '16px 40px',
                            fontSize: '1.2rem',
                            borderRadius: 'var(--radius-full)',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
                            marginBottom: 'var(--spacing-xl)',
                            transform: 'scale(1)',
                            transition: 'var(--transition)',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            border: '2px solid rgba(255,255,255,0.2)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                            e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'scale(1) translateY(0)';
                            e.currentTarget.style.backgroundColor = 'var(--color-primary)';
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
                                /*
                                 Each image: 260px wide + 30px gap = 290px total per item.
                                 We have 5 original images so the true width of one set is 5 * 290px = 1450px.
                                 To loop seamlessly, we translate exactly that width.
                                */
                                @keyframes slideDesktop {
                                    from { transform: translateX(0); }
                                    to { transform: translateX(-1450px); }
                                }
                                
                                /* Mobile calculations: 180px + 20px gap = 200px * 5 = 1000px */
                                @keyframes slideMobile {
                                    from { transform: translateX(0); }
                                    to { transform: translateX(-1000px); }
                                }
                                
                                .slider-wrapper {
                                    display: flex;
                                    width: max-content;
                                    animation: slideDesktop 30s linear infinite;
                                    gap: 30px;
                                    align-items: center;
                                    padding-top: 20px;
                                    padding-bottom: 30px;
                                }

                                .slider-img {
                                    width: 260px;
                                    height: 260px;
                                    object-fit: cover;
                                    border-radius: var(--radius-lg);
                                    box-shadow: var(--shadow-lg);
                                    flex-shrink: 0;
                                    transform: rotate(-3deg);
                                    transition: var(--transition);
                                }
                                
                                .slider-img:nth-child(even) {
                                    transform: rotate(4deg) translateY(10px);
                                }
                                
                                .slider-img:hover {
                                    transform: scale(1.05) rotate(0deg) !important;
                                    box-shadow: var(--shadow-hover);
                                    z-index: 10;
                                }

                                @media (max-width: 768px) {
                                    .slider-img {
                                        width: 180px;
                                        height: 180px;
                                    }
                                    .slider-wrapper {
                                        animation: slideMobile 20s linear infinite;
                                        gap: 20px;
                                    }
                                }
                            `}
                        </style>
                        <div className="slider-wrapper">
                            {/* Original Set (1) */}
                            <img src={rollitosImg} alt="Rollitos de Canela" className="slider-img" />
                            <img src={alfajorImg} alt="Alfajor Artesanal" className="slider-img" />
                            <img src={galletasImg} alt="Galletas Decoradas" className="slider-img" />
                            <img src={galletas4Img} alt="Galletas 4" className="slider-img" />
                            <img src={galletas5Img} alt="Galletas 5" className="slider-img" />

                            {/* Duplicate Set for Seamless Loop (2) */}
                            <img src={rollitosImg} alt="Rollitos de Canela" className="slider-img" />
                            <img src={alfajorImg} alt="Alfajor Artesanal" className="slider-img" />
                            <img src={galletasImg} alt="Galletas Decoradas" className="slider-img" />
                            <img src={galletas4Img} alt="Galletas 4" className="slider-img" />
                            <img src={galletas5Img} alt="Galletas 5" className="slider-img" />

                            {/* Triplicate Set for ultra-wides (3) */}
                            <img src={rollitosImg} alt="Rollitos de Canela" className="slider-img" />
                            <img src={alfajorImg} alt="Alfajor Artesanal" className="slider-img" />
                            <img src={galletasImg} alt="Galletas Decoradas" className="slider-img" />
                            <img src={galletas4Img} alt="Galletas 4" className="slider-img" />
                            <img src={galletas5Img} alt="Galletas 5" className="slider-img" />

                            {/* Quadruplicate Set to prevent any cutting errors on large screens during swap */}
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
                    <h2 className="section-title" style={{ fontFamily: 'var(--font-body)' }}>Productos Disponibles</h2>

                    {loading ? (
                        <p style={{ textAlign: 'center' }}>Cargando dulzura...</p>
                    ) : (
                        <div className="products-grid">
                            {(Array.isArray(products) ? products : [])
                                .filter(p => p && p.id && p.active)
                                .map(product => (
                                    <ProductCard
                                        key={String(product.id)}
                                        product={product}
                                        onSelect={() => setSelectedProduct(product)}
                                    />
                                ))}
                        </div>
                    )}
                </div>
            </section>

            <ProductDetailModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </div>
    );
};

export default Home;
