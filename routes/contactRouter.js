const express = require('express');
const { contact } = require('../controllers/contactUsController');
const contactRouter = express.Router();

contactRouter.post('/api/contact', contact);

module.exports = contactRouter;
