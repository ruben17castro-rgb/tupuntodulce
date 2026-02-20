import React, { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContextCore';
import { useSettings } from '../context/SettingsContextCore';
import { Plus, Edit2, Trash2, Eye, EyeOff, Lock, MessageCircle, Save, X as XIcon } from 'lucide-react';
import ProductForm from '../components/ProductForm';

const AdminDashboard = () => {
    const { products, addProduct, updateProduct, removeProduct, toggleStatus } = useProducts();
    const { whatsappNumber, bankDetails, updateWhatsAppNumber, updateBankDetails } = useSettings();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Local state for editing (so we don't save every keystroke to Firebase)
    const [localWsp, setLocalWsp] = useState(whatsappNumber);
    const [localBank, setLocalBank] = useState(bankDetails);

    // Update local state when context changes (e.g. on mount/sync)
    useEffect(() => {
        setLocalWsp(whatsappNumber);
    }, [whatsappNumber]);

    useEffect(() => {
        setLocalBank(bankDetails);
    }, [bankDetails]);

    const [isWspEditing, setIsWspEditing] = useState(false);
    const [isBankEditing, setIsBankEditing] = useState(false);

    const handleSaveWsp = async () => {
        try {
            await updateWhatsAppNumber(localWsp);
            setIsWspEditing(false);
        } catch {
            alert("Error al guardar el número");
        }
    };

    const handleSaveBank = async () => {
        try {
            await updateBankDetails(localBank);
            setIsBankEditing(false);
        } catch {
            alert("Error al guardar los datos bancarios");
        }
    };

    const handleBankChange = (e) => {
        setLocalBank({ ...localBank, [e.target.name]: e.target.value });
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'admin123') { // Simple MVP password
            setIsAuthenticated(true);
        } else {
            alert('Contraseña incorrecta');
        }
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleSave = async (product) => {
        try {
            if (product.id) {
                await updateProduct(product);
            } else {
                await addProduct(product);
            }
            setIsFormOpen(false);
        } catch (error) {
            console.error("Error al guardar:", error);
            alert(error.message || "Ocurrió un error al guardar el producto.");
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '40px',
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-md)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: '#eee',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px'
                    }}>
                        <Lock size={30} color="#666" />
                    </div>
                    <h2 style={{ marginBottom: '20px' }}>Acceso Administrativo</h2>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Contraseña"
                            style={{ marginBottom: '20px' }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            Ingresar
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
            }}>
                <h1 style={{ fontSize: '2rem' }}>Panel de Administración</h1>
                <button onClick={handleAdd} className="btn btn-primary" style={{ display: 'flex', gap: '8px' }}>
                    <Plus size={20} />
                    Nuevo Producto
                </button>
            </div>

            {/* Configuration Section (WhatsApp & Bank) */}
            <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '30px',
                display: 'grid',
                gridTemplateColumns: '1fr 2fr',
                gap: '30px'
            }}>
                {/* WhatsApp Config */}
                <div style={{ borderRight: '1px solid #eee', paddingRight: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageCircle size={18} color="var(--color-wsp)" />
                        Configuración WhatsApp
                    </h3>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        backgroundColor: '#f0fdf4',
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid #dcfce7'
                    }}>
                        {isWspEditing ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                                <input
                                    type="text"
                                    value={localWsp}
                                    onChange={(e) => setLocalWsp(e.target.value)}
                                    placeholder="569..."
                                    style={{
                                        padding: '6px 10px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        flex: 1,
                                        fontSize: '0.9rem'
                                    }}
                                />
                                <button onClick={handleSaveWsp} style={{ background: 'none', color: 'var(--color-success)', cursor: 'pointer' }} title="Guardar">
                                    <Save size={20} />
                                </button>
                                <button onClick={() => setIsWspEditing(false)} style={{ background: 'none', color: '#666', cursor: 'pointer' }} title="Cancelar">
                                    <XIcon size={20} />
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.95rem', color: '#166534', fontWeight: '500' }}>
                                    {localWsp}
                                </span>
                                <button onClick={() => setIsWspEditing(true)} style={{ background: 'none', color: '#166534', cursor: 'pointer', opacity: 0.7 }} title="Editar Número">
                                    <Edit2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bank Config */}
                <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Lock size={18} color="var(--color-secondary)" />
                        Datos de Transferencia
                    </h3>

                    {isBankEditing ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <input name="bank" value={localBank.bank} onChange={handleBankChange} placeholder="Banco" style={{ padding: '8px', fontSize: '0.9rem' }} />
                            <input name="type" value={localBank.type} onChange={handleBankChange} placeholder="Tipo de Cuenta" style={{ padding: '8px', fontSize: '0.9rem' }} />
                            <input name="number" value={localBank.number} onChange={handleBankChange} placeholder="Número de Cuenta" style={{ padding: '8px', fontSize: '0.9rem' }} />
                            <input name="rut" value={localBank.rut} onChange={handleBankChange} placeholder="RUT" style={{ padding: '8px', fontSize: '0.9rem' }} />
                            <input name="name" value={localBank.name} onChange={handleBankChange} placeholder="Nombre Titular" style={{ padding: '8px', fontSize: '0.9rem' }} />
                            <input name="email" value={localBank.email} onChange={handleBankChange} placeholder="Correo" style={{ padding: '8px', fontSize: '0.9rem' }} />
                            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button onClick={() => setIsBankEditing(false)} className="btn btn-secondary" style={{ padding: '6px 15px' }}>Cancelar</button>
                                <button onClick={handleSaveBank} className="btn btn-primary" style={{ padding: '6px 15px', display: 'flex', gap: '5px' }}><Save size={16} /> Guardar</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            backgroundColor: '#f8fafc',
                            padding: '15px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid #e2e8f0',
                            position: 'relative'
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
                                <div><strong>Banco:</strong> {localBank.bank}</div>
                                <div><strong>Tipo:</strong> {localBank.type}</div>
                                <div><strong>Número:</strong> {localBank.number || 'No asignado'}</div>
                                <div><strong>RUT:</strong> {localBank.rut || 'No asignado'}</div>
                                <div><strong>Nombre:</strong> {localBank.name}</div>
                                <div><strong>Email:</strong> {localBank.email || 'No asignado'}</div>
                            </div>
                            <button
                                onClick={() => setIsBankEditing(true)}
                                style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', color: '#64748b', cursor: 'pointer' }}
                                title="Editar Datos Bancarios"
                            >
                                <Edit2 size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div style={{
                backgroundColor: 'white',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Producto</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Precio</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>Stock</th>
                            <th style={{ padding: '15px', textAlign: 'center' }}>Estado</th>
                            <th style={{ padding: '15px', textAlign: 'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            opacity: product.active ? 1 : 0.5
                                        }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{product.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#888' }}>ID: {product.id}</div>
                                    </div>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    ${product.price.toLocaleString('es-CL')}
                                </td>
                                <td style={{ padding: '15px', textAlign: 'center', fontWeight: 'bold', color: (!product.stock || product.stock > 0) ? 'inherit' : '#e74c3c' }}>
                                    {product.stock !== undefined ? product.stock : '-'}
                                </td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    <button
                                        onClick={() => toggleStatus(product.id)}
                                        style={{
                                            background: 'none',
                                            color: product.active ? 'var(--color-wsp)' : '#999',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto'
                                        }}
                                        title={product.active ? "Desactivar" : "Activar"}
                                    >
                                        {product.active ? <Eye size={20} /> : <EyeOff size={20} />}
                                    </button>
                                </td>
                                <td style={{ padding: '15px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => handleEdit(product)}
                                            style={{ background: 'none', color: 'var(--color-secondary)' }}
                                            title="Editar"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('¿Estás seguro de eliminar este producto?')) {
                                                    removeProduct(product.id);
                                                }
                                            }}
                                            style={{ background: 'none', color: '#ff6b6b' }}
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {products.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                        No hay productos registrados.
                    </div>
                )}
            </div>

            {isFormOpen && (
                <ProductForm
                    product={editingProduct}
                    onSave={handleSave}
                    onCancel={() => setIsFormOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
