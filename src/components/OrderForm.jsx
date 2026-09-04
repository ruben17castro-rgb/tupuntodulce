import React, { useState } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';

const OrderForm = ({ products, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        deliveryDate: '',
        deliveryTime: '',
        comments: '',
        items: []
    });

    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [selectedPackId, setSelectedPackId] = useState('');

    const selectedProductObj = React.useMemo(() => {
        return products.find(p => String(p.id) === String(selectedProductId));
    }, [products, selectedProductId]);

    // Auto-select first pack when selecting product
    React.useEffect(() => {
        if (selectedProductObj && selectedProductObj.hasPacks && Array.isArray(selectedProductObj.packs) && selectedProductObj.packs.length > 0) {
            setSelectedPackId(String(selectedProductObj.packs[0].id));
        } else {
            setSelectedPackId('');
        }
    }, [selectedProductObj]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddItem = () => {
        if (!selectedProductId || !selectedProductObj) return;

        const hasPacks = Boolean(selectedProductObj.hasPacks) && Array.isArray(selectedProductObj.packs) && selectedProductObj.packs.length > 0;
        const chosenPack = hasPacks
            ? (selectedProductObj.packs.find(p => String(p.id) === String(selectedPackId)) || selectedProductObj.packs[0])
            : null;

        const itemId = chosenPack ? `${selectedProductObj.id}_pack_${chosenPack.id}` : String(selectedProductObj.id);
        const itemName = chosenPack
            ? `${selectedProductObj.name} (${chosenPack.name})`
            : selectedProductObj.name;
        const itemPrice = chosenPack ? Number(chosenPack.price) : Number(selectedProductObj.price);

        // Check if already in items
        const existingItemIndex = formData.items.findIndex(i => String(i.id) === String(itemId));
        if (existingItemIndex >= 0) {
            const newItems = [...formData.items];
            newItems[existingItemIndex].quantity += Number(selectedQuantity);
            setFormData({ ...formData, items: newItems });
        } else {
            setFormData({
                ...formData,
                items: [
                    ...formData.items,
                    {
                        id: itemId,
                        productId: selectedProductObj.id,
                        name: itemName,
                        price: itemPrice,
                        quantity: Number(selectedQuantity),
                        currentStock: selectedProductObj.stock,
                        selectedPack: chosenPack
                    }
                ]
            });
        }

        // Reset inputs
        setSelectedProductId('');
        setSelectedQuantity(1);
        setSelectedPackId('');
    };

    const handleRemoveItem = (indexToRemove) => {
        setFormData({
            ...formData,
            items: formData.items.filter((_, idx) => idx !== indexToRemove)
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.items.length === 0) {
            alert('Debes agregar al menos un producto al pedido.');
            return;
        }

        const total = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        onSave({
            ...formData,
            total
        });
    };

    const totalCalculated = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: 'var(--radius-lg)',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'white',
                    zIndex: 10
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', margin: 0 }}>
                        Nuevo Pedido Manual
                    </h2>
                    <button type="button" onClick={onCancel} style={{ background: 'none' }}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
                    {/* Sección Cliente */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Cliente</label>
                            <input
                                type="text"
                                name="customerName"
                                required
                                value={formData.customerName}
                                onChange={handleChange}
                                placeholder="Nombre completo"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Teléfono</label>
                            <input
                                type="text"
                                name="customerPhone"
                                required
                                value={formData.customerPhone}
                                onChange={handleChange}
                                placeholder="Ej: +56 9 1234 5678"
                            />
                        </div>
                    </div>

                    {/* Sección Fecha/Hora */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Fecha Entrega</label>
                            <input
                                type="date"
                                name="deliveryDate"
                                required
                                value={formData.deliveryDate}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Hora Estimada</label>
                            <input
                                type="time"
                                name="deliveryTime"
                                required
                                value={formData.deliveryTime}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Sección Productos */}
                    <div style={{
                        backgroundColor: '#f8fafc',
                        padding: '15px',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '15px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Agregar Productos</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                                <div style={{ flex: 1 }}>
                                    <select 
                                        value={selectedProductId} 
                                        onChange={(e) => setSelectedProductId(e.target.value)}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                    >
                                        <option value="">Selecciona un producto...</option>
                                        {products.filter(p => p.active).map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} - ${p.price} {p.hasPacks && p.packs?.length > 0 ? `(${p.packs.length} packs)` : ''} (Stock: {p.stock || 0})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ width: '80px' }}>
                                    <input 
                                        type="number" 
                                        min="1"
                                        value={selectedQuantity}
                                        onChange={(e) => setSelectedQuantity(e.target.value)}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                                <button 
                                    type="button"
                                    onClick={handleAddItem}
                                    className="btn btn-secondary"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '37px', padding: '0 15px' }}
                                    disabled={!selectedProductId}
                                >
                                    <Plus size={18} />
                                </button>
                            </div>

                            {selectedProductObj?.hasPacks && Array.isArray(selectedProductObj.packs) && selectedProductObj.packs.length > 0 && (
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: '4px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Seleccionar Pack:</span>
                                    {selectedProductObj.packs.map(pack => (
                                        <label key={pack.id} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                name="manualOrderPack"
                                                value={pack.id}
                                                checked={selectedPackId === String(pack.id)}
                                                onChange={() => setSelectedPackId(String(pack.id))}
                                            />
                                            {pack.name} (${Number(pack.price).toLocaleString('es-CL')})
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Lista de productos agregados */}
                        {formData.items.length > 0 && (
                            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', fontSize: '0.9rem' }}>
                                <tbody>
                                    {formData.items.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '8px' }}>{item.quantity}x</td>
                                            <td style={{ padding: '8px', width: '100%' }}>{item.name}</td>
                                            <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>${(item.price * item.quantity).toLocaleString('es-CL')}</td>
                                            <td style={{ padding: '8px', textAlign: 'right' }}>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveItem(idx)}
                                                    style={{ background: 'none', color: '#ef4444', padding: '2px', cursor: 'pointer' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td colSpan="2" style={{ padding: '10px 8px', fontWeight: 'bold', textAlign: 'right' }}>TOTAL:</td>
                                        <td colSpan="2" style={{ padding: '10px 8px', fontWeight: 'bold' }}>
                                            ${totalCalculated.toLocaleString('es-CL')}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Comentarios (Opcional)</label>
                        <textarea
                            name="comments"
                            rows="2"
                            value={formData.comments}
                            onChange={handleChange}
                            placeholder="Alergias, dedicatorias, o anotaciones internas."
                        ></textarea>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button type="button" onClick={onCancel} className="btn btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: '5px' }}>
                            <Save size={18} />
                            Guardar Pedido
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrderForm;
