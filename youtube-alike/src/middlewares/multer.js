import multer from 'multer';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      const extension = file.originalname.split('.').pop(); // Get the file extension
      cb(null, file.fieldname+ '.' + extension);
    
    }
  })
  
export const upload = multer({ storage: storage })