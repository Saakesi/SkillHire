import express from "express";
import multer from "multer";
import { matchCandidatesByJD } from "../controllers/jdController.js";

const router = express.Router();
const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 5 * 1024 * 1024,
	},
	fileFilter: (req, file, cb) => {
		const name = (file.originalname || "").toLowerCase();
		const allowed = [".pdf", ".docx", ".txt", ".md"];
		if (allowed.some((ext) => name.endsWith(ext))) return cb(null, true);
		return cb(new Error("Unsupported file type. Upload PDF, DOCX, TXT, or MD."));
	},
});

router.post(
	"/match",
	(req, res, next) => {
		upload.single("jdFile")(req, res, (err) => {
			if (!err) return next();
			if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
				return res.status(400).json({ error: "File too large. Max size is 5MB." });
			}
			return res.status(400).json({ error: err.message || "Invalid file upload." });
		});
	},
	matchCandidatesByJD
);

export default router;
