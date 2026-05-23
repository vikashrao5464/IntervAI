import multer from 'multer';

// Configure disk storage for uploaded files
const storage = multer.diskStorage({
    // Destination folder for uploads (relative to project root)
    destination: function (req, file, cb) {
        cb(null, "public");
    },

    // Create a unique filename by prefixing with a timestamp
    filename: function (req, file, cb) {
        const filename = Date.now() + "-" + file.originalname;
        cb(null, filename);
    },
});

// Export a multer upload middleware with a 5MB file size limit
export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});