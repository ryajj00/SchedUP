"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateImageFromDataUrl = validateImageFromDataUrl;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
function validateImageFromDataUrl(input, bodyMimeType) {
    if (!input || typeof input !== 'string') {
        throw new Error('No image was provided.');
    }
    const matches = /^data:(image\/[a-zA-Z0-9.+-]+);base64,/.exec(input);
    if (!matches) {
        throw new Error('Unsupported image format.');
    }
    const mimeType = matches[1].toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        throw new Error('Unsupported image type. Please upload a JPEG, PNG, or WebP image.');
    }
    if (bodyMimeType && !ALLOWED_MIME_TYPES.has(bodyMimeType.toLowerCase())) {
        throw new Error('The provided MIME type is not supported.');
    }
    const sizeBytes = Math.max(0, (input.length * 3) / 4 - (input.includes('base64,') ? input.split('base64,')[1].length % 4 : 0));
    if (sizeBytes > MAX_IMAGE_BYTES) {
        throw new Error('Image is too large. Please upload a smaller file.');
    }
    return { validatedMimeType: mimeType, sizeBytes };
}
