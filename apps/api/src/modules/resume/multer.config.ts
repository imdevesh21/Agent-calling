import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads/resumes',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

      cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),

  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'), false);
    }

    cb(null, true);
  },

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
};
