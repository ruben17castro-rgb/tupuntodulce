import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import { ProductProvider } from './context/ProductContext';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AdminDashboard from './pages/AdminDashboard';

// Safety component to prevent white screen of death
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Crash caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#e53e3e' }}>¡Oops! Algo salió mal 🍰</h2>
          <p>La aplicación encontró un error:</p>
          <code style={{
            display: 'block',
            padding: '10px',
            background: '#fff5f5',
            border: '1px solid #feb2b2',
            borderRadius: '4px',
            margin: '20px auto',
            maxWidth: '80%',
            overflowX: 'auto',
            textAlign: 'left'
          }}>
            {this.state.error ? this.state.error.toString() : 'Error desconocido'}
          </code>
          <button
            className="btn btn-primary"
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
            style={{ marginTop: '20px' }}
          >
            Reiniciar Tienda (Limpiar Datos)
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SettingsProvider>
          <ProductProvider>
            <CartProvider>
              <div className="app-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <main style={{ flex: 1 }}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                  </Routes>
                </main>
                <footer style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: '#999',
                  fontSize: '0.9rem',
                  borderTop: '1px solid #eee'
                }}>
                  © {new Date().getFullYear()} Tu Punto Dulce
                </footer>

                {/* Global components */}
                <CartDrawer />
                <CheckoutModal />
              </div>
            </CartProvider>
          </ProductProvider>
        </SettingsProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
