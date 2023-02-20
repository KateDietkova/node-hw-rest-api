const express = require("express");

const router = express.Router();
const {
  getAll,
  getById,
  add,
  updateById,
  deleteById,
} = require("../../controllers/contacts");

const schemas = require("../../schemas/contacts");
const validateBody = require("../../middlewares/validateBody")


router.get("/", getAll);

router.get("/:contactId", getById);

router.post("/", validateBody(schemas.addSchema), add);

router.put("/:contactId", validateBody(schemas.updateSchema), updateById);

router.delete("/:contactId", deleteById);



module.exports = router;
