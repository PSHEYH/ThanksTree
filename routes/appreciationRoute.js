const express = require("express");
const guard = require('../middlewares/guard');
const appreciationController = require('../controllers/appreciationController');
const schemaValidator = require('../middlewares/schemaValidator');
const schemas = require('../schemas/appreciationSchemas');
const validateRequest = schemaValidator(schemas);

const router = express.Router();

router.route('/').post(guard, validateRequest, appreciationController.createAppreciation);
router.route('/:id')
    .get(guard, appreciationController.listAppreciation)
    .patch(guard, appreciationController.updateAppreciation)
    .delete(guard, appreciationController.deleteAppreciation);

module.exports = router;