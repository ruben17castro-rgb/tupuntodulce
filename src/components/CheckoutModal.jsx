import React, { useState } from 'react';
import { X, MessageCircle, Copy, Check } from 'lucide-react';
import { useCart } from '../context/CartContextCore';
import { useProducts } from '../context/ProductContextCore';
import { useSettings } from '../context/SettingsContextCore';
import { saveOrderFirebase } from '../services/firebaseService';

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

    const [copiedField, setCopiedField] = useState(null);

    const copyToClipboard = async (text, fieldName) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(fieldName);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const copyAllBankDetails = () => {
        const text = `Banco: ${bankDetails.bank}\nTipo: ${bankDetails.type}\nNúmero: ${bankDetails.number}\nRUT: ${bankDetails.rut}\nNombre: ${bankDetails.name}\nEmail: ${bankDetails.email}`;
        copyToClipboard(text, 'all');
    };

    if (!isCheckoutOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Format WhatsApp Message safely
            const productsList = (Array.isArray(cart) ? cart : [])
                .filter(item => item && item.name)
                .map(item => `- ${item.name} x${item.quantity || 1} (${((Number(item.price) || 0) * (item.quantity || 1)).toLocaleString('es-CL')})`)
                .join('%0A');

            const totalStr = (Number(cartTotal) || 0).toLocaleString('es-CL');
            const cleanClientPhone = (formData.phone || '').toString().replace(/[^\d]/g, '');
            const fullPhoneForm = cleanClientPhone ? `+56${cleanClientPhone}` : `+56 ${formData.phone}`;
            // Utilizar %2B en lugar del signo +, porque el signo + en las URL significa "espacio"
            const urlPhone = cleanClientPhone ? `%2B56${cleanClientPhone}` : `%2B56 ${formData.phone}`;

            const message = `*Hola Tu Punto Dulce, quiero hacer el siguiente pedido:*%0A%0A` +
                `*Cliente:* ${formData.name || 'N/A'}%0A` +
                `*Teléfono:* ${urlPhone}%0A` +
                `*Fecha Entrega:* ${formData.date || 'N/A'}%0A` +
                `*Hora:* ${formData.time || 'N/A'}%0A` +
                (formData.comments ? `*Comentarios:* ${formData.comments}%0A` : '') +
                `%0A*Pedido:*%0A${productsList}%0A%0A` +
                `*TOTAL:* $${totalStr}`;

            // Clean WhatsApp number to only contain digits
            const cleanPhone = (whatsappNumber || '').toString().replace(/[^\d]/g, '');
            let finalUrl = `https://wa.me/${cleanPhone}?text=${message}`;

            // 1. Save order to Firebase
            const orderData = {
                customerName: formData.name,
                customerPhone: fullPhoneForm,
                deliveryDate: formData.date,
                deliveryTime: formData.time,
                comments: formData.comments,
                items: (Array.isArray(cart) ? cart : []).map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                total: cartTotal
            };
            try {
                await saveOrderFirebase(orderData);
            } catch (firebaseErr) {
                console.error("Error al guardar el pedido en Firebase:", firebaseErr);
                // Si falla Firebase, agregamos una nota discreta al final del mensaje de WhatsApp para que el admin lo sepa
                const extraMsg = "%0A%0A_⚠️ Msje automático interno: Este pedido NO quedó guardado en el Panel Administrativo. Por favor, regístralo manualmente._";
                finalUrl = `https://wa.me/${cleanPhone}?text=${message}${extraMsg}`;
            }

            // 2. Discount stock (Sync with storage)
            const itemsToDiscount = (Array.isArray(cart) ? cart : []).map(item => ({
                id: item?.id,
                quantity: Number(item?.quantity) || 1
            })).filter(i => i.id);

            // AWAIT the network request so the browser doesn't kill it when we navigate away
            try {
                await discountStock(itemsToDiscount);
            } catch (stockErr) {
                console.error("Non-critical error: could not discount stock", stockErr);
            }

            // 2. Clear cart and close modal BEFORE navigating away!
            clearCart();
            closeCheckout();

            // 3. Wait slightly so state updates can run, then open WhatsApp
            setTimeout(() => {
                window.open(finalUrl, '_blank') || (window.location.href = finalUrl);
            }, 100);
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                                padding: '12px 14px',
                                backgroundColor: '#f1f5f9',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                color: '#475569',
                                fontWeight: '500',
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                +56
                            </span>
                            <input
                                type="tel"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="9 1234 5678"
                                style={{ margin: 0, flex: 1 }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem', color: 'var(--color-secondary)' }}>Fecha Entrega *</label>
                            <input
                                type="date"
                                name="date"
                                required
                                value={formData.date}
                                onChange={handleChange}
                                style={{ width: '100%', height: '42px', padding: '0 10px', boxSizing: 'border-box', margin: 0 }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '0.9rem', color: 'var(--color-secondary)' }}>Hora Estimada *</label>
                            <input
                                type="text"
                                name="time"
                                required
                                value={formData.time}
                                onChange={handleChange}
                                placeholder="Ej: 13:00"
                                style={{ width: '100%', height: '42px', padding: '0 10px', boxSizing: 'border-box', margin: 0 }}
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
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <strong>Número:</strong> {bankDetails.number}
                                        <button 
                                            type="button" 
                                            onClick={() => copyToClipboard(bankDetails.number, 'number')}
                                            style={{ background: 'none', color: copiedField === 'number' ? '#10b981' : '#64748b', border: 'none', cursor: 'pointer', padding: '2px' }}
                                            title="Copiar solo número"
                                        >
                                            {copiedField === 'number' ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    </p>
                                    <p><strong>RUT:</strong> {bankDetails.rut}</p>
                                    <p><strong>Nombre:</strong> {bankDetails.name}</p>
                                    <p><strong>Email:</strong> {bankDetails.email}</p>
                                    <button 
                                        type="button" 
                                        onClick={copyAllBankDetails}
                                        style={{
                                            marginTop: '8px',
                                            padding: '6px 12px',
                                            backgroundColor: '#f1f5f9',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: 'var(--radius-sm)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            cursor: 'pointer',
                                            color: copiedField === 'all' ? '#10b981' : '#475569',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        {copiedField === 'all' ? <Check size={16} /> : <Copy size={16} />}
                                        {copiedField === 'all' ? 'Datos Copiados' : 'Copiar Todos los Datos'}
                                    </button>
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
                            Al confirmar, se abrirá WhatsApp con los detalles de tu pedido. <strong>Por favor adjunta el comprobante de transferencia al mensaje.</strong>
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
