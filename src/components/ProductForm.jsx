import React, { useState, useEffect } from 'react';
import { X, Save, Upload } from 'lucide-react';
import { optimizeImage } from '../utils/imageOptimizer';

const ProductForm = ({ product, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        image: '',
        stock: 0,
        active: true
    });

    useEffect(() => {
        if (product) {
            setFormData({
                ...product,
                stock: product.stock !== undefined ? product.stock : 0
            });
        }
    }, [product]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Resize to max 1200px and compress (quality 0.8)
                const optimizedImage = await optimizeImage(file, 1200, 0.8);
                setFormData(prev => ({ ...prev, image: optimizedImage }));
            } catch (error) {
                console.error("Error optimizing image:", error);
                alert("Error al procesar la imagen.");
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting form data:", formData);
        try {
            onSave({
                ...formData,
                price: Number(formData.price),
                stock: Number(formData.stock),
                id: product ? product.id : undefined // Keep ID if editing
            });
        } catch (error) {
            console.error("Error in onSave:", error);
            alert("Error al guardar: " + error.message);
        }
    };

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
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
                        {product ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                    <button onClick={onCancel} style={{ background: 'none' }}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Nombre</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Precio (CLP)</label>
                            <input
                                type="number"
                                name="price"
                                required
                                value={formData.price}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Stock</label>
                            <input
                                type="number"
                                name="stock"
                                required
                                min="0"
                                value={formData.stock}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Imagen</label>

                        {/* Image Preview */}
                        {formData.image && (
                            <div style={{
                                marginBottom: '10px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: '1px solid #eee',
                                height: '200px',
                                width: '100%',
                                position: 'relative'
                            }}>
                                <img
                                    src={formData.image}
                                    alt="Preview"
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#f9f9f9' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, image: '' })}
                                    style={{
                                        position: 'absolute',
                                        top: '5px',
                                        right: '5px',
                                        background: 'rgba(0,0,0,0.5)',
                                        color: 'white',
                                        borderRadius: '50%',
                                        padding: '4px'
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <div style={{
                            border: '2px dashed #ddd',
                            borderRadius: '8px',
                            padding: '20px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'border-color 0.2s',
                            backgroundColor: '#fafafa'
                        }} onClick={() => document.getElementById('fileInput').click()}>
                            <Upload size={24} color="#999" style={{ marginBottom: '5px' }} />
                            <p style={{ color: '#666', fontSize: '0.9rem' }}>Click para subir imagen</p>
                            <input
                                id="fileInput"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Descripción</label>
                        <textarea
                            name="description"
                            rows="3"
                            value={formData.description}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            name="active"
                            id="active"
                            checked={formData.active}
                            onChange={handleChange}
                            style={{ width: 'auto' }}
                        />
                        <label htmlFor="active">Producto Activo (Visible en catálogo)</label>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onCancel} className="btn btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: '5px' }}>
                            <Save size={18} />
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;
