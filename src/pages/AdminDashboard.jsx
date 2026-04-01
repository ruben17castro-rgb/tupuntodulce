import React, { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContextCore';
import { useSettings } from '../context/SettingsContextCore';
import { Plus, Edit2, Trash2, Eye, EyeOff, Lock, MessageCircle, Save, X as XIcon, LogOut, BarChart2 } from 'lucide-react';
import ProductForm from '../components/ProductForm';
import OrderForm from '../components/OrderForm';
import { useAuth } from '../context/AuthContext';
import {
    subscribeToPageViews,
    subscribeToOrders,
    deleteOrderFirebase,
    saveOrderFirebase
} from '../services/firebaseService';

const AdminDashboard = () => {
    const { products, addProduct, updateProduct, removeProduct, toggleStatus, discountStock } = useProducts();
    const { whatsappNumber, bankDetails, updateWhatsAppNumber, updateBankDetails } = useSettings();
    const { logout } = useAuth();
    const [editingProduct, setEditingProduct] = useState(null);
    const [pageViews, setPageViews] = useState(0);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'orders'

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
    
    // Mes seleccionado (por defecto el actual)
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const filteredOrders = React.useMemo(() => {
        if (!selectedMonth) return orders;
        const [year, month] = selectedMonth.split('-');
        return orders.filter(order => {
            if (!order.createdAt) return false;
            const d = new Date(order.createdAt);
            return d.getFullYear() === parseInt(year) && d.getMonth() + 1 === parseInt(month);
        });
    }, [orders, selectedMonth]);

    // Format month for display
    const formattedMonth = React.useMemo(() => {
        if (!selectedMonth) return 'el Mes';
        const [year, month] = selectedMonth.split('-');
        const date = new Date(year, month - 1);
        const name = date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
        return 'de ' + name.charAt(0).toUpperCase() + name.slice(1);
    }, [selectedMonth]);

    // Subscribe to page views
    useEffect(() => {
        const unsubscribe = subscribeToPageViews((views) => {
            setPageViews(views);
        });
        return () => unsubscribe();
    }, []);

    // Subscribe to orders
    useEffect(() => {
        const unsubscribe = subscribeToOrders((newOrders) => {
            setOrders(newOrders);
        });
        return () => unsubscribe();
    }, []);

    // Print button event listener (Problema 2 - CAUSA B) con nueva ventana
    useEffect(() => {
        const btnImprimir = document.querySelector('[data-action="imprimir"]');
        if (!btnImprimir) return;

        const handlePrint = function(e) {
            e.preventDefault();

            function formatPrecio(n) {
                return '$' + Number(n).toLocaleString('es-CL');
            }

            const filas = filteredOrders.map((order, i) => {
                const productos = order.items.map(item => {
                    return `<b>${item.name}</b> x${item.quantity}` + (item.price ? ` — ${formatPrecio(item.price)}` : '');
                }).join('<br><br>');
                
                const commentsHtml = order.comments ? `<div style="margin-top: 8px; font-style: italic; color: #555; font-size: 0.9em;">Notas: ${order.comments}</div>` : '';

                return `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center; vertical-align: top;">${i + 1}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd; vertical-align: top;">${new Date(order.createdAt).toLocaleDateString('es-CL')}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; vertical-align: top;">${order.customerName}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #555; vertical-align: top;">${order.customerPhone}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd; vertical-align: top;">${order.deliveryDate} ${order.deliveryTime}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd; font-size: 0.9em; vertical-align: top;">${productos}${commentsHtml}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; text-align: right; vertical-align: top;">${formatPrecio(order.total)}</td>
                    </tr>
                `;
            }).join('');

            const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Reporte de Pedidos</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
                    th { background-color: #f4f4f4; padding: 12px 10px; text-align: left; border-bottom: 2px solid #ddd; font-weight: bold; }
                    th:first-child { text-align: center; }
                    th:last-child { text-align: right; }
                    @page { size: letter portrait; margin: 20mm; }
                </style>
            </head>
            <body>
                <h2 style="margin: 0 0 5px 0;">Reporte de Pedidos — Tu Punto Dulce</h2>
                <p style="margin: 0 0 20px 0; color: #666; font-size: 14px;">
                    Generado el ${new Date().toLocaleDateString('es-CL')} a las ${new Date().toLocaleTimeString('es-CL')} · ${filteredOrders.length} pedidos
                </p>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 5%">#</th>
                            <th style="width: 12%">Fecha pedido</th>
                            <th style="width: 20%">Cliente</th>
                            <th style="width: 15%">Teléfono</th>
                            <th style="width: 15%">Entrega</th>
                            <th style="width: 22%">Detalle Productos</th>
                            <th style="width: 11%">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filas}
                    </tbody>
                </table>
            </body>
            </html>
            `;

            setTimeout(() => {
                const w = window.open('', '_blank');
                if (w) {
                    w.document.write(html);
                    w.document.close();
                    setTimeout(() => { 
                        w.print(); 
                    }, 400);
                }
            }, 350);
        };

        btnImprimir.addEventListener('click', handlePrint);
        return () => btnImprimir.removeEventListener('click', handlePrint);
    }, [activeTab, filteredOrders, products]);

    // Montly Sales and Average Order stats
    const stats = React.useMemo(() => {
        const totalSales = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const avgOrder = filteredOrders.length > 0 ? Math.round(totalSales / filteredOrders.length) : 0;

        return {
            totalSales,
            avgOrder,
            count: filteredOrders.length
        };
    }, [filteredOrders]);

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

    const handleAddOrder = () => setIsOrderFormOpen(true);

    const handleSaveOrder = async (orderData) => {
        try {
            await saveOrderFirebase(orderData);
            
            // Descontar stock (igual que en CheckoutModal)
            const itemsToDiscount = orderData.items.map(item => ({
                id: item.id,
                quantity: item.quantity
            }));
            await discountStock(itemsToDiscount);
            
            setIsOrderFormOpen(false);
            alert("Pedido manual agregado exitosamente.");
        } catch (error) {
            console.error("Error al guardar pedido manual:", error);
            alert("Hubo un error al guardar el pedido.");
        }
    };



    return (
        <div className="container" style={{ padding: '40px 20px', fontFamily: 'var(--font-body)' }}>
            <div className="no-print" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
            }}>
                <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-body)' }}>Panel de Administración</h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={logout}
                        className="btn btn-secondary"
                        style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#f8f9fa', border: '1px solid #ddd', color: '#666' }}
                    >
                        <LogOut size={18} />
                        Cerrar Sesión
                    </button>
                    <button onClick={handleAdd} className="btn btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Plus size={20} />
                        Nuevo Producto
                    </button>
                </div>

            </div>

            {/* Tabs Navigation */}
            <div className="no-print" style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '20px',
                borderBottom: '1px solid #eee',
                paddingBottom: '0',
                justifyContent: 'space-between',
                flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <button
                        onClick={() => setActiveTab('products')}
                        style={{
                            padding: '10px 20px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'products' ? '3px solid var(--color-primary)' : '3px solid transparent',
                            color: activeTab === 'products' ? 'var(--color-primary)' : '#666',
                            fontWeight: activeTab === 'products' ? '600' : '400',
                            cursor: 'pointer',
                            fontSize: '1.1rem'
                        }}
                    >
                        Productos
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        style={{
                            padding: '10px 20px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'orders' ? '3px solid var(--color-primary)' : '3px solid transparent',
                            color: activeTab === 'orders' ? 'var(--color-primary)' : '#666',
                            fontWeight: activeTab === 'orders' ? '600' : '400',
                            cursor: 'pointer',
                            fontSize: '1.1rem'
                        }}
                    >
                        Pedidos
                    </button>
                </div>
                {activeTab === 'orders' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '10px' }}>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>Filtrar por mes:</span>
                        <input 
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid #ddd',
                                fontSize: '0.9rem',
                                color: '#333'
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Top Stats Section */}
            <div className="no-print" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                }}>
                    <div style={{
                        backgroundColor: '#eff6ff',
                        padding: '16px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <BarChart2 size={32} color="#3b82f6" />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeTab === 'products' ? 'Visitas Totales' : `Ventas ${formattedMonth}`}</p>
                        <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {activeTab === 'products' ? pageViews : `$${stats.totalSales.toLocaleString('es-CL')}`}
                        </h2>
                    </div>
                </div>

                {activeTab === 'orders' && (
                    <>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px'
                        }}>
                            <div style={{
                                backgroundColor: '#f0fdf4',
                                padding: '16px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Save size={32} color="#22c55e" />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Pedido Promedio</p>
                                <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>${stats.avgOrder.toLocaleString('es-CL')}</h2>
                            </div>
                        </div>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px'
                        }}>
                            <div style={{
                                backgroundColor: '#fef2f2',
                                padding: '16px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <MessageCircle size={32} color="#ef4444" />
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Pedidos {formattedMonth}</p>
                                <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stats.count}</h2>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {activeTab === 'products' ? (
                <>
                    {/* Configuration Section (WhatsApp & Bank) */}
                    <div className="no-print seccion-configuracion" style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-sm)',
                        marginBottom: '30px'
                    }}>
                        {/* WhatsApp Config */}
                        <div style={{ borderRight: '1px solid #eee', paddingRight: '20px' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-body)' }}>
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
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-body)' }}>
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
                        <table className="tabla-productos" style={{ width: '100%', borderCollapse: 'collapse' }}>
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

                        <div className="productos-cards">
                            {products.map(product => (
                                <div key={product.id} className="admin-product-card">
                                    <div className="top-row">
                                        <img src={product.image} alt={product.name} style={{ opacity: product.active ? 1 : 0.5 }} />
                                        <div>
                                            <div style={{ fontWeight: '600' }}>{product.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#888' }}>ID: {product.id}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="meta-row">
                                        <div><strong>Precio:</strong> ${product.price.toLocaleString('es-CL')}</div>
                                        <div style={{ color: (!product.stock || product.stock > 0) ? 'inherit' : '#e74c3c' }}>
                                            <strong>Stock:</strong> {product.stock !== undefined ? product.stock : '-'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <strong>Estado:</strong>
                                            <button
                                                onClick={() => toggleStatus(product.id)}
                                                style={{
                                                    background: 'none', padding: 0,
                                                    color: product.active ? 'var(--color-wsp)' : '#999',
                                                    display: 'flex', alignItems: 'center'
                                                }}
                                                title={product.active ? "Desactivar" : "Activar"}
                                            >
                                                {product.active ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="actions">
                                        <button onClick={() => handleEdit(product)} className="btn btn-secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '5px', padding: '8px' }}>
                                            <Edit2 size={16} /> Editar
                                        </button>
                                        <button onClick={() => { if (window.confirm('¿Estás seguro de eliminar este producto?')) removeProduct(product.id); }} className="btn btn-secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '5px', padding: '8px', color: '#ff6b6b' }}>
                                            <Trash2 size={16} /> Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {products.length === 0 && (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                                No hay productos registrados.
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-sm)',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <div className="no-print button-group" style={{ padding: '15px', display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '10px', borderBottom: '1px solid #eee' }}>
                        <button
                            onClick={handleAddOrder}
                            className="btn btn-primary btn-mobile-full"
                            style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                        >
                            <Plus size={18} />
                            Ingresar Pedido Manual
                        </button>
                        <button
                            data-action="imprimir"
                            className="btn btn-secondary btn-mobile-full print-btn btn-imprimir-fix"
                            style={{ 
                                display: 'flex', gap: '8px', alignItems: 'center'
                            }}
                        >
                            <BarChart2 size={18} />
                            Imprimir Reporte
                        </button>
                    </div>

                    <div className="print-only" style={{ display: 'none', padding: '20px', textAlign: 'center', borderBottom: '2px solid #333', marginBottom: '20px' }}>
                        <h1 style={{ margin: '0 0 10px 0' }}>Resumen de Pedidos - Tu Punto Dulce</h1>
                        <p style={{ margin: 0 }}>Generado el {new Date().toLocaleDateString('es-CL')} a las {new Date().toLocaleTimeString('es-CL')}</p>
                    </div>

                    <table className="orders-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>
                            <tr>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Fecha</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Cliente</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Entrega</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Detalle Productos</th>
                                <th style={{ padding: '15px', textAlign: 'right' }}>Total</th>
                                <th className="no-print" style={{ padding: '15px', textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px', verticalAlign: 'top', fontSize: '0.9rem' }}>
                                        {new Date(order.createdAt).toLocaleDateString('es-CL')}
                                    </td>
                                    <td style={{ padding: '15px', verticalAlign: 'top' }}>
                                        <div style={{ fontWeight: '600' }}>{order.customerName}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{order.customerPhone}</div>
                                    </td>
                                    <td style={{ padding: '15px', verticalAlign: 'top' }}>
                                        <div>{order.deliveryDate}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{order.deliveryTime}</div>
                                    </td>
                                    <td style={{ padding: '15px', verticalAlign: 'top' }}>
                                        <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '0.85rem' }}>
                                            {order.items.map((item, idx) => (
                                                <li key={idx}>
                                                    {item.name} x{item.quantity}
                                                </li>
                                            ))}
                                        </ul>
                                        {order.comments && (
                                            <div style={{ marginTop: '5px', fontSize: '0.8rem', color: '#666', fontStyle: 'italic' }}>
                                                "{order.comments}"
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold' }}>
                                        ${order.total.toLocaleString('es-CL')}
                                    </td>
                                    <td className="no-print" style={{ padding: '15px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('¿Estás seguro de eliminar este pedido del historial?')) {
                                                    deleteOrderFirebase(order.id);
                                                }
                                            }}
                                            style={{ background: 'none', color: '#ff6b6b' }}
                                            title="Eliminar de historial"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="orders-mobile print-only-hide">
                        {filteredOrders.map(order => (
                            <div key={order.id} className="mobile-order-card">
                                <div className="moc-header">
                                    <span className="moc-date">{new Date(order.createdAt).toLocaleDateString('es-CL')}</span>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('¿Estás seguro de eliminar este pedido del historial?')) {
                                                deleteOrderFirebase(order.id);
                                            }
                                        }}
                                        className="moc-delete"
                                        title="Eliminar de historial"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="moc-customer">
                                    <strong>{order.customerName}</strong>
                                    <span>{order.customerPhone}</span>
                                </div>
                                <div className="moc-delivery">
                                    <span>Entrega: {order.deliveryDate}</span>
                                    <span className="moc-time">{order.deliveryTime}</span>
                                </div>
                                <div className="moc-products">
                                    <ul>
                                        {order.items.map((item, idx) => (
                                            <li key={idx}>
                                                {item.name} x{item.quantity}
                                            </li>
                                        ))}
                                    </ul>
                                    {order.comments && (
                                        <div className="moc-comments">"{order.comments}"</div>
                                    )}
                                </div>
                                <div className="moc-total">
                                    Total: ${order.total.toLocaleString('es-CL')}
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredOrders.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                            No hay pedidos registrados en {formattedMonth.replace('de ', '')}.
                        </div>
                    )}
                </div>
            )}

            {isFormOpen && (
                <ProductForm
                    product={editingProduct}
                    onSave={handleSave}
                    onCancel={() => setIsFormOpen(false)}
                />
            )}

            {isOrderFormOpen && (
                <OrderForm
                    products={products}
                    onSave={handleSaveOrder}
                    onCancel={() => setIsOrderFormOpen(false)}
                />
            )}

            <style>{`
                /* CONFIGURATION SECTION CSS */
                .seccion-configuracion {
                    display: flex;
                    flex-direction: row;
                    gap: 12px;
                    width: 100%;
                    box-sizing: border-box;
                    overflow: hidden;
                }
                .seccion-configuracion > * {
                    flex: 1 1 0;
                    min-width: 0;
                    box-sizing: border-box;
                    overflow: hidden;
                    word-break: break-word;
                }

                /* PRINT BUTTON iOS FIX */
                .btn-imprimir-fix {
                    touch-action: manipulation;
                    -webkit-tap-highlight-color: transparent;
                    cursor: pointer;
                }

                /* PRODUCT CARDS CSS */
                .admin-product-card {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 14px;
                    border-bottom: 1px solid #e5e5e5;
                }
                .admin-product-card .top-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .admin-product-card .top-row img {
                    width: 48px;
                    height: 48px;
                    border-radius: 8px;
                    object-fit: cover;
                    flex-shrink: 0;
                }
                .admin-product-card .meta-row {
                    display: flex;
                    gap: 16px;
                    font-size: 14px;
                    flex-wrap: wrap;
                    align-items: center;
                }
                .admin-product-card .actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 4px;
                }

                @media (max-width: 767px) {
                    /* ocultar tabla */
                    .tabla-productos { display: none !important; }
                    /* mostrar cards */
                    .productos-cards { display: block; }
                }
                @media (min-width: 768px) {
                    .tabla-productos { display: table; }
                    .productos-cards { display: none; }
                }

                /* MOBILE STYLES */
                .orders-mobile { display: none; }

                @media (max-width: 480px) {
                    /* Container override */
                    .container { width: 100% !important; padding: 16px 14px !important; box-sizing: border-box !important; }
                    
                    /* Buttons inside Admin Dashboard */
                    .btn-mobile-full { width: 100% !important; min-height: 44px !important; justify-content: center !important; }
                    .button-group { flex-direction: column !important; }

                    /* Metric cards into 100% or 2 columns */
                    div[style*="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))"] {
                        grid-template-columns: 1fr 1fr !important;
                        gap: 12px !important;
                    }
                    /* Overriding specifically the stat cards */
                    div[style*="minmax(240px, 1fr)"] > div {
                        padding: 12px !important;
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 8px !important;
                        box-sizing: border-box;
                    }
                    div[style*="minmax(240px, 1fr)"] > div > div:first-child {
                        padding: 10px !important;
                    }
                    div[style*="minmax(240px, 1fr)"] > div h2 {
                        font-size: 1.25rem !important;
                    }
                    div[style*="minmax(240px, 1fr)"] > div p {
                        font-size: 0.8rem !important;
                    }

                    /* Orders Table to Cards */
                    .orders-table { display: none !important; }
                    .orders-mobile { 
                        display: flex !important; 
                        flex-direction: column;
                        gap: 16px;
                        padding: 16px 0;
                    }
                    .print-only-hide { display: block; }

                    .mobile-order-card {
                        background: white;
                        border: 1px solid #e2e8f0;
                        border-radius: 8px;
                        padding: 16px;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        box-sizing: border-box;
                    }
                    .moc-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .moc-date {
                        font-size: 0.8rem;
                        color: #64748b;
                        background: #f1f5f9;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-weight: 500;
                    }
                    .moc-delete {
                        background: none;
                        color: #ef4444;
                        padding: 6px;
                        cursor: pointer;
                        border: none;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 4px;
                    }
                    .moc-customer {
                        display: flex;
                        flex-direction: column;
                        font-size: 1.05rem;
                        color: #0f172a;
                    }
                    .moc-customer span {
                        font-size: 0.85rem;
                        color: #64748b;
                        font-weight: normal;
                        margin-top: 2px;
                    }
                    .moc-delivery {
                        background: #f0fdf4;
                        padding: 10px;
                        border-radius: 6px;
                        font-size: 0.85rem;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border: 1px solid #dcfce7;
                        color: #166534;
                    }
                    .moc-time {
                        font-weight: 700;
                        font-size: 0.9rem;
                    }
                    .moc-products {
                        font-size: 0.9rem;
                        border-top: 1px dashed #e2e8f0;
                        padding-top: 10px;
                        color: #334155;
                    }
                    .moc-products ul {
                        margin: 0;
                        padding-left: 20px;
                    }
                    .moc-products li {
                        margin-bottom: 4px;
                    }
                    .moc-comments {
                        font-size: 0.85rem;
                        color: #64748b;
                        font-style: italic;
                        margin-top: 8px;
                        padding: 8px;
                        background: #f8fafc;
                        border-radius: 4px;
                    }
                    .moc-total {
                        font-weight: 700;
                        font-size: 1.15rem;
                        color: #0f172a;
                        text-align: right;
                        border-top: 1px solid #e2e8f0;
                        padding-top: 10px;
                    }
                }

                /* MOBILE LANDSCAPE STYLES */
                @media (max-height: 500px) and (orientation: landscape) {
                    .container { padding: 12px 16px !important; box-sizing: border-box !important; }
                    .mobile-order-card { padding: 12px !important; }
                    /* Overriding specifically the stat cards */
                    div[style*="minmax(240px, 1fr)"] > div {
                        flex-direction: row !important;
                        align-items: center !important;
                        padding: 12px !important;
                    }
                }

                @media print {
                    @page { margin: 1cm; size: portrait; }
                    body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    .container { padding: 0 !important; width: 100% !important; max-width: none !important; margin: 0 !important; box-shadow: none !important; }
                    
                    table { 
                        width: 100% !important; 
                        border-collapse: collapse !important; 
                        border: 1px solid #000 !important; 
                        font-size: 8pt !important; 
                        table-layout: fixed !important; /* Forces fixed layout to avoid overflow */
                    }
                    th { 
                        background-color: #f2f2f2 !important; 
                        border: 1px solid #000 !important; 
                        padding: 8px 4px !important; 
                        color: black !important;
                        font-weight: bold !important;
                        text-align: left !important;
                    }
                    td { 
                        border: 1px solid #000 !important; 
                        padding: 8px 4px !important; 
                        word-break: break-word !important;
                        vertical-align: top !important;
                        color: black !important;
                    }
                    h1, p { color: black !important; margin: 5px 0 !important; }
                    
                    /* Specific column widths for better fit on small sheets */
                    th:nth-child(1), td:nth-child(1) { width: 15%; } /* Fecha */
                    th:nth-child(2), td:nth-child(2) { width: 20%; } /* Cliente */
                    th:nth-child(3), td:nth-child(3) { width: 15%; } /* Entrega */
                    th:nth-child(4), td:nth-child(4) { width: 35%; } /* Detalle */
                    th:nth-child(5), td:nth-child(5) { width: 15%; } /* Total */

                    /* Hide interactive actions during print */
                    .no-print, button { display: none !important; }
                    
                    tr { page-break-inside: avoid !important; }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
