const express = require("express");
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const guard = require("../middlewares/guard");
const schemaValidator = require('../middlewares/schemaValidator');
const schemas = require('../schemas/schemas');
const validateRequest = schemaValidator(schemas);

const router = express.Router();

router.route('/auth/loginGoogle').post(validateRequest, authController.loginGoogle);
router.route('/auth/loginApple').post(validateRequest, authController.loginApple);
router.route('/auth/refreshToken').post(validateRequest, authController.refreshToken);
router.route('/auth/deleteAccount').delete(guard, authController.deleteAccount);
router.route('/auth/login').post(validateRequest, authController.login);

router.route('/profile')
    .get(guard, validateRequest, userController.getProfile)
    .patch(guard, validateRequest, userController.updateProfile);

router.route('/backups')
    .post(guard, userController.saveBackup)
    .get(guard, userController.getBackup);

module.exports = router;