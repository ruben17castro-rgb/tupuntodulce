import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    subscribeToProducts,
    addProductFirebase,
    updateProductFirebase,
    deleteProductFirebase,
    discountStockFirebase
} from '../services/firebaseService';
import { ProductContext } from './ProductContextCore';

/**
 * Product Provider Component
 */
export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Suscribirse a cambios en tiempo real desde Firebase
        const unsubscribe = subscribeToProducts((data) => {
            setProducts(data);
            setLoading(false);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const addProduct = useCallback(async (product) => {
        try {
            await addProductFirebase(product);
        } catch (err) {
            console.error("Error adding product:", err);
            throw err;
        }
    }, []);

    const updateProduct = useCallback(async (product) => {
        try {
            const { id, ...data } = product;
            await updateProductFirebase(id, data);
        } catch (err) {
            console.error("Error updating product:", err);
            throw err;
        }
    }, []);

    const removeProduct = useCallback(async (id) => {
        try {
            await deleteProductFirebase(id);
        } catch (err) {
            console.error("Error deleting product:", err);
            throw err;
        }
    }, []);

    const toggleStatus = useCallback(async (id) => {
        const product = products.find(p => p.id === id);
        if (product) {
            try {
                // Pass the full product object to updateProduct to avoid data loss in mapToFirestore
                await updateProduct({ ...product, active: !product.active });
            } catch (err) {
                console.error("Error toggling status:", err);
            }
        }
    }, [products, updateProduct]);

    const discountStock = useCallback(async (cartItems) => {
        try {
            const itemsToUpdate = cartItems.map(item => {
                const product = products.find(p => p.id === item.id);
                const currentStock = Number(product?.stock) || 0;
                return {
                    id: item.id,
                    newStock: Math.max(0, currentStock - (Number(item.quantity) || 0))
                };
            });
            await discountStockFirebase(itemsToUpdate);
        } catch (err) {
            console.error("Error discounting stock:", err);
        }
    }, [products]);

    const contextValue = useMemo(() => ({
        products,
        loading,
        addProduct,
        updateProduct,
        removeProduct,
        toggleStatus,
        discountStock
    }), [products, loading, addProduct, updateProduct, removeProduct, toggleStatus, discountStock]);

    return (
        <ProductContext.Provider value={contextValue}>
            {children}
        </ProductContext.Provider>
    );
};

