import {
    collection,
    onSnapshot,
    doc,
    updateDoc,
    addDoc,
    deleteDoc,
    getDoc,
    setDoc,
    query,
    orderBy,
    increment,
    serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase/config";

const PRODUCTS_COLLECTION = "productos";
const ORDERS_COLLECTION = "pedidos";

/**
 * Mapeo de campos Firestore (Español) -> App (Inglés)
 */
const mapFromFirestore = (doc) => {
    const data = doc.data();
    return {
        id: doc.id,
        name: data.nombre || '',
        description: data.descripcion || '',
        price: Number(data.precio) || 0,
        image: data.imagen || '',
        stock: Number(data.stock) || 0,
        active: data.activo ?? true
    };
};

/**
 * Mapeo de campos App (Inglés) -> Firestore (Español)
 */
const mapToFirestore = (data) => {
    return {
        nombre: data.name || '',
        descripcion: data.description || '',
        precio: Number(data.price) || 0,
        imagen: data.image || '',
        stock: Number(data.stock) || 0,
        activo: data.active ?? true
    };
};

/**
 * Escucha cambios en los productos en tiempo real
 */
export const subscribeToProducts = (callback) => {
    // Ordenamos por el nombre real en Firestore
    const q = query(collection(db, PRODUCTS_COLLECTION), orderBy("nombre", "asc"));
    return onSnapshot(q, (snapshot) => {
        const products = snapshot.docs.map(doc => mapFromFirestore(doc));
        callback(products);
    }, (error) => {
        console.error("Error subscribing to products:", error);
    });
};

/**
 * Actualiza el stock de varios productos (Checkout)
 */
export const discountStockFirebase = async (items) => {
    try {
        for (const item of items) {
            const productRef = doc(db, PRODUCTS_COLLECTION, item.id);
            await updateDoc(productRef, {
                stock: Math.max(0, Number(item.newStock))
            });
        }
    } catch (error) {
        console.error("Error updating stock in Firebase:", error);
        throw error;
    }
};

/**
 * Actualiza un producto individual (Admin)
 */
export const updateProductFirebase = async (id, data) => {
    try {
        const productRef = doc(db, PRODUCTS_COLLECTION, id);
        const firestoreData = mapToFirestore(data);
        await updateDoc(productRef, firestoreData);
    } catch (error) {
        console.error("Error updating product in Firebase:", error);
        throw error;
    }
};

/**
 * Agrega un nuevo producto (Admin)
 */
export const addProductFirebase = async (data) => {
    try {
        const firestoreData = mapToFirestore(data);
        const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), firestoreData);
        return docRef.id;
    } catch (error) {
        console.error("Error adding product to Firebase:", error);
        throw error;
    }
};

/**
 * Elimina un producto (Admin)
 */
export const deleteProductFirebase = async (id) => {
    try {
        await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
    } catch (error) {
        console.error("Error deleting product in Firebase:", error);
        throw error;
    }
};

const CONFIG_COLLECTION = "config";
const SETTINGS_DOC = "settings";

/**
 * Obtiene la configuración global (WhatsApp, Banco)
 */
export const getSettingsFirebase = async () => {
    try {
        const docRef = doc(db, CONFIG_COLLECTION, SETTINGS_DOC);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null;
    } catch (error) {
        console.error("Error getting settings from Firebase:", error);
        return null;
    }
};

/**
 * Suscripción a la configuración global
 */
export const subscribeToSettings = (callback) => {
    return onSnapshot(doc(db, CONFIG_COLLECTION, SETTINGS_DOC), (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data());
        } else {
            callback(null);
        }
    });
};

/**
 * Guarda la configuración global
 */
export const saveSettingsFirebase = async (data) => {
    try {
        const docRef = doc(db, CONFIG_COLLECTION, SETTINGS_DOC);
        await setDoc(docRef, data, { merge: true });
    } catch (error) {
        console.error("Error updating settings in Firebase:", error);
        throw error;
    }
};

/**
 * ==========================================
 * ESTADÍSTICAS Y VISITAS
 * ==========================================
 */

const STATS_COLLECTION = "stats";
const VISITS_DOC = "visits_counter";

/**
 * Incrementa el contador de visitas en 1
 */
export const incrementPageViewsFirebase = async () => {
    try {
        const docRef = doc(db, STATS_COLLECTION, VISITS_DOC);
        await setDoc(docRef, { totalViews: increment(1) }, { merge: true });
    } catch (error) {
        console.error("Error incrementing page views in Firebase:", error);
    }
};

/**
 * Suscripción al contador de visitas en tiempo real para el Admin Dashboard
 */
export const subscribeToPageViews = (callback) => {
    return onSnapshot(doc(db, STATS_COLLECTION, VISITS_DOC), (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data().totalViews || 0);
        } else {
            callback(0);
        }
    });
};

/**
 * ==========================================
 * GESTIÓN DE PEDIDOS (ORDENES)
 * ==========================================
 */

/**
 * Guarda un nuevo pedido en Firestore
 */
export const saveOrderFirebase = async (orderData) => {
    try {
        const docData = {
            clienteNombre: orderData.customerName || '',
            clienteTelefono: orderData.customerPhone || '',
            fechaEntrega: orderData.deliveryDate || '',
            horaEntrega: orderData.deliveryTime || '',
            comentarios: orderData.comments || '',
            items: orderData.items || [],
            total: Number(orderData.total) || 0,
            creadoEn: serverTimestamp(),
            estado: 'pendiente'
        };
        const docRef = await addDoc(collection(db, ORDERS_COLLECTION), docData);
        return docRef.id;
    } catch (error) {
        console.error("Error saving order in Firebase:", error);
        throw error;
    }
};

/**
 * Suscripción a los pedidos en tiempo real
 */
export const subscribeToOrders = (callback) => {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy("creadoEn", "desc"));
    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => {
            const data = doc.data();
            // Handle timestamp safely
            let createdAt = new Date();
            if (data.creadoEn && typeof data.creadoEn.toDate === 'function') {
                createdAt = data.creadoEn.toDate();
            }

            return {
                id: doc.id,
                customerName: data.clienteNombre,
                customerPhone: data.clienteTelefono,
                deliveryDate: data.fechaEntrega,
                deliveryTime: data.horaEntrega,
                comments: data.comentarios,
                items: data.items,
                total: data.total,
                createdAt: createdAt,
                status: data.estado
            };
        });
        callback(orders);
    }, (error) => {
        console.error("Error subscribing to orders:", error);
    });
};

/**
 * Elimina un pedido (Admin)
 */
export const deleteOrderFirebase = async (id) => {
    try {
        await deleteDoc(doc(db, ORDERS_COLLECTION, id));
    } catch (error) {
        console.error("Error deleting order in Firebase:", error);
        throw error;
    }
};
