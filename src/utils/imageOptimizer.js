/**
 * Optimizes an image file by resizing it to a maximum dimension and applying compression.
 * @param {File} file - The original image file.
 * @param {number} maxDimension - The maximum width or height.
 * @param {number} quality - Compression quality (0 to 1).
 * @returns {Promise<string>} - A promise that resolves with the optimized data URL.
 */
export const optimizeImage = (file, maxDimension = 1200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions maintaining aspect ratio
                if (width > height) {
                    if (width > maxDimension) {
                        height *= maxDimension / width;
                        width = maxDimension;
                    }
                } else {
                    if (height > maxDimension) {
                        width *= maxDimension / height;
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                // Use imageSmoothingEnabled for better quality
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                ctx.drawImage(img, 0, 0, width, height);

                // Convert to JPEG with specified quality
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = (error) => reject(new Error("Error loading image for optimization: " + error.message));
        };
        reader.onerror = (error) => reject(new Error("Error reading file: " + error.message));
    });
};
