const STORAGE_KEY = 'tpd_products';
const STORAGE_KEY_WSP = 'tpd_wsp_number';
const STORAGE_KEY_BANK = 'tpd_bank_details';

const DEFAULT_BANK_DETAILS = {
    bank: 'Banco Estado',
    type: 'Cuenta RUT',
    number: '',
    rut: '',
    name: 'Tu Punto Dulce',
    email: ''
};

export const getBankDetails = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY_BANK);
        if (!saved || saved === 'null') return DEFAULT_BANK_DETAILS;
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_BANK_DETAILS, ...parsed };
    } catch (e) {
        console.error("Error reading bank details:", e);
        return DEFAULT_BANK_DETAILS;
    }
};

export const saveBankDetails = (details) => {
    try {
        localStorage.setItem(STORAGE_KEY_BANK, JSON.stringify(details));
    } catch (e) {
        console.error("Error saving bank details:", e);
    }
    return details;
};

export const getWhatsAppNumber = () => {
    try {
        return localStorage.getItem(STORAGE_KEY_WSP) || '56912345678';
    } catch {
        return '56912345678';
    }
};

export const saveWhatsAppNumber = (number) => {
    try {
        localStorage.setItem(STORAGE_KEY_WSP, number);
        window.dispatchEvent(new Event('wsp-update'));
    } catch (e) {
        console.error("Error saving WSP:", e);
    }
    return number;
};


const SEED_DATA = [
    {
        id: "1",
        name: 'Torta de Chocolate',
        price: 25000,
        description: 'Deliciosa torta húmeda de chocolate con ganache.',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=60',
        stock: 10,
        active: true
    },
    {
        id: "2",
        name: 'Cheesecake de Frutos Rojos',
        price: 28000,
        description: 'Base crujiente, crema suave y topping de frutos del bosque.',
        image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&q=60',
        stock: 5,
        active: true
    },
    {
        id: "3",
        name: 'Caja de Macarons (6u)',
        price: 12000,
        description: 'Surtido de macarons artesanales de varios sabores.',
        image: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400&q=60',
        stock: 20,
        active: true
    },
    {
        id: "4",
        name: 'Pie de Limón',
        price: 18000,
        description: 'Clásico pie de limón con merengue italiano.',
        image: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400&q=60',
        stock: 0,
        active: true
    }
];

export const getProducts = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored || stored === 'null') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
        return SEED_DATA;
    }
    try {
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return SEED_DATA;
        return parsed
            .filter(p => p && p.id)
            .map(p => ({ ...p, id: String(p.id) }));
    } catch {
        return SEED_DATA;
    }
};

export const saveProduct = (product) => {
    const products = getProducts();
    if (product.id) {
        // Edit
        const index = products.findIndex(p => p.id === product.id);
        if (index !== -1) {
            products[index] = product;
        }
    } else {
        // Add
        product.id = Date.now();
        products.push(product);
    }
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        window.dispatchEvent(new Event('product-update'));
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            throw new Error("El almacenamiento está lleno. Intenta subir una imagen más pequeña o eliminar productos antiguos.");
        }
        throw e;
    }
    return products;
};

export const deleteProduct = (id) => {
    let products = getProducts();
    products = products.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event('product-update'));
    return products;
};

export const toggleProductStatus = (id) => {
    const products = getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products[index].active = !products[index].active;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        window.dispatchEvent(new Event('product-update'));
    }
    return products;
};

export const decrementStock = (cartItems) => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        let products = [];
        try {
            products = stored ? JSON.parse(stored) : SEED_DATA;
        } catch (e) {
            products = SEED_DATA;
        }

        if (!Array.isArray(products)) products = SEED_DATA;

        let hasChanges = false;
        // Create a deep copy to work with
        const newProducts = JSON.parse(JSON.stringify(products));

        cartItems.forEach(item => {
            if (!item || !item.id) return;
            const index = newProducts.findIndex(p => p && String(p.id) === String(item.id));
            if (index !== -1) {
                const currentStock = Number(newProducts[index].stock);
                if (!isNaN(currentStock)) {
                    const qtyToReduce = Number(item.quantity) || 0;
                    newProducts[index].stock = Math.max(0, currentStock - qtyToReduce);
                    hasChanges = true;
                }
            }
        });

        if (hasChanges) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
            // Only dispatch if actually saved
            window.dispatchEvent(new Event('product-update'));
        }
        return newProducts;
    } catch (error) {
        console.error("Critical error in decrementStock:", error);
        if (error.name === 'QuotaExceededError') {
            alert("⚠️ Error: El almacenamiento está lleno. El pedido se enviará pero el stock no se pudo descontar.");
        }
        return getProducts();
    }
};

