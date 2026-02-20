import React, { useState } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContextCore';
import { useProducts } from '../context/ProductContextCore';
import { useSettings } from '../context/SettingsContextCore';

const CheckoutModal = () => {
    const { cart, cartTotal, isCheckoutOpen, closeCheckout, clearCart } = useCart();
    const { discountStock } = useProducts();
    const { whatsappNumber, bankDetails } = useSettings();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        date: '',
        time: '',
        comments: ''
    });

    if (!isCheckoutOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        try {
            // Format WhatsApp Message safely
            const productsList = (Array.isArray(cart) ? cart : [])
                .filter(item => item && item.name)
                .map(item => `- ${item.name} x${item.quantity || 1} (${((Number(item.price) || 0) * (item.quantity || 1)).toLocaleString('es-CL')})`)
                .join('%0A');

            const totalStr = (Number(cartTotal) || 0).toLocaleString('es-CL');

            const message = `*Hola Tu Punto Dulce, quiero hacer el siguiente pedido:*%0A%0A` +
                `*Cliente:* ${formData.name || 'N/A'}%0A` +
                `*Teléfono:* ${formData.phone || 'N/A'}%0A` +
                `*Fecha Entrega:* ${formData.date || 'N/A'}%0A` +
                `*Hora:* ${formData.time || 'N/A'}%0A` +
                (formData.comments ? `*Comentarios:* ${formData.comments}%0A` : '') +
                `%0A*Pedido:*%0A${productsList}%0A%0A` +
                `*TOTAL:* $${totalStr}`;

            const url = `https://wa.me/${whatsappNumber}?text=${message}`;

            // 1. First Discount stock (Sync with storage)
            const itemsToDiscount = (Array.isArray(cart) ? cart : []).map(item => ({
                id: item?.id,
                quantity: Number(item?.quantity) || 1
            })).filter(i => i.id);

            discountStock(itemsToDiscount);

            // 2. Open WhatsApp
            window.open(url, '_blank');

            // 3. Staggered sequence to allow DOM to breathe
            setTimeout(() => {
                closeCheckout();
                console.log("Modal closed, waiting to clear cart...");
                setTimeout(() => {
                    clearCart();
                    console.log("Cart cleared.");
                }, 800); // Give it nearly a second before clearing data
            }, 500);
        } catch (err) {
            console.error("Critical error in checkout:", err);
            alert("Hubo un error al procesar el pedido. Por favor intenta de nuevo.");
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                key="checkout-modal-overlay"
                onClick={closeCheckout}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 2000,
                    animation: 'fadeIn 0.3s ease'
                }}
            />

            {/* Modal */}
            <div key="checkout-modal-content" style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '90vh',
                backgroundColor: 'white',
                zIndex: 2001,
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                flexDirection: 'column',
                animation: 'modalSlideUp 0.3s ease',
                overflow: 'hidden'
            }}>
                <div key="modal-header" style={{
                    padding: '20px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'white'
                }}>
                    <h2 key="header-title" style={{ fontSize: '1.5rem', margin: 0 }}>Finalizar Pedido</h2>
                    <button key="close-btn" onClick={closeCheckout} style={{ background: 'none', color: '#666' }}>
                        <X size={24} />
                    </button>
                </div>

                <form key="checkout-form" onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '20px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Nombre Completo *</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ej: Juan Pérez"
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Teléfono *</label>
                        <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+56 9 1234 5678"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Fecha Entrega *</label>
                            <input
                                type="date"
                                name="date"
                                required
                                value={formData.date}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Hora Estimada *</label>
                            <input
                                type="text"
                                name="time"
                                required
                                value={formData.time}
                                onChange={handleChange}
                                placeholder="Ej: 13:00"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Comentarios Adicionales</label>
                        <textarea
                            name="comments"
                            rows="3"
                            value={formData.comments}
                            onChange={handleChange}
                            placeholder="Dedicatoria, alergias, etc."
                        ></textarea>
                    </div>

                    <div style={{
                        backgroundColor: '#f8fafc',
                        padding: '15px',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '15px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '10px', color: 'var(--color-secondary)' }}>Datos para Transferencia:</h3>
                        {(() => {
                            return (
                                <div style={{ fontSize: '0.85rem', color: '#444' }}>
                                    <p><strong>Banco:</strong> {bankDetails.bank}</p>
                                    <p><strong>Tipo:</strong> {bankDetails.type}</p>
                                    <p><strong>Número:</strong> {bankDetails.number}</p>
                                    <p><strong>RUT:</strong> {bankDetails.rut}</p>
                                    <p><strong>Nombre:</strong> {bankDetails.name}</p>
                                    <p><strong>Email:</strong> {bankDetails.email}</p>
                                </div>
                            );
                        })()}
                    </div>

                    <div style={{
                        backgroundColor: '#f0fdf4',
                        padding: '15px',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '20px',
                        border: '1px solid #dcfce7'
                    }}>
                        <p style={{ fontSize: '0.9rem', color: '#166534' }}>
                            Al confirmar, se abrirá WhatsApp con los detalles de tu pedido. **Por favor adjunta el comprobante de transferencia al mensaje.**
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            backgroundColor: 'var(--color-wsp)',
                            display: 'flex',
                            gap: '8px'
                        }}
                    >
                        <MessageCircle size={20} />
                        Enviar Pedido por WhatsApp
                    </button>
                </form>
            </div>
        </>
    );
};

export default CheckoutModal;
