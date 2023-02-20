const express = require("express");
const Joi = require("joi");

const router = express.Router();
const contacts = require("../../models/contacts");
const HttpError = require("../../helpers/HttpError");

const addSchema = Joi.object({
  "name": Joi.string().min(3).max(30).required(),
  "phone": Joi.string().min(5).max(30).required(),
  "email": Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .required(),
});

const updateSchema = Joi.object({
  name: Joi.string().min(3).max(30).optional(),
  phone: Joi.string().min(5).max(30).optional(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .optional(),
});

router.get("/", async (req, res, next) => {
  try {
    const contactsList = await contacts.listContacts();
    res.json(contactsList);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const contact = await contacts.getContactById(contactId);
    if (!contact) {
      throw HttpError(404, "Not found");
    }
    res.json(contact);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { error } = addSchema.validate(req.body);
    if (error) {
      throw HttpError(400, "missing required name field");
    }
    const newContact = await contacts.addContact(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});
 
router.delete("/:contactId", async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const deletedContact = await contacts.removeContact(contactId);
    if (!deletedContact) {
      throw HttpError(404, "Not found");
    }
    res.json({ message: "contact deleted" });
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    if (Object.keys(req.body).length === 0) {
      throw HttpError(400, "missing fields");
    }
    const { error } = updateSchema.validate(req.body);
    console.log(req.body.name);
    if (error) {
      throw HttpError(400, error.message);
    }
    const { contactId } = req.params;
    const updateContact = await contacts.updateContact(contactId, req.body);
    if (!updateContact) {
      throw HttpError(404, "Not found");
    }
    res.json(updateContact);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
