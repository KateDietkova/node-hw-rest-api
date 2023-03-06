const express = require("express");

const router = express.Router();
const {
  getAll,
  getById,
  add,
  updateById,
  updateStatusContact,
  deleteById,
} = require("../../controllers/contacts");

const schemas = require("../../schemas/contacts");
const validateBody = require("../../middlewares/validateBody");
const isValidId = require("../../middlewares/isValidId");
const authenticate = require("../../middlewares/authenticate");

router.get("/", authenticate, getAll);

router.get("/:contactId", authenticate, isValidId, getById);

router.post("/", authenticate, validateBody(schemas.addSchema), add);

router.put(
  "/:contactId",
  authenticate,
  isValidId,
  validateBody(schemas.updateSchema),
  updateById
);

router.patch(
  "/:contactId/favorite",
  authenticate,
  validateBody(schemas.updateFavorite),
  updateStatusContact
);

router.delete("/:contactId", authenticate, isValidId, deleteById);

module.exports = router;
