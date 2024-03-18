const multer = require("multer");
const path = require("path");
const { default: ShortUniqueId } = require("short-unique-id");
const { promises: fsPromises } = require("fs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationPath = "/tmp";
        cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
        const uid = new ShortUniqueId({ dictionary: "number" });
        const uidWithTimestamp = uid.randomUUID(15);
        const originalname = file.originalname;
        const fileExtension = path.extname(originalname);
        const filename = `${uidWithTimestamp}${fileExtension}`;
        cb(null, filename);
    },
});

const upload = multer({ storage: storage });
module.exports = upload;
