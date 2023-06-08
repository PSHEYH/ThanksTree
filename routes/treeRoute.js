const express = require("express");
const guard = require('../middlewares/guard');
const schemaValidator = require('../middlewares/schemaValidator');
const schemas = require('../schemas/treeSchema');
const treeController = require('../controllers/treeController');
const isTreeOwner = require("../middlewares/isTreeOwner");
const router = express.Router();
const schemaValidate = schemaValidator(schemas);

router.route('/').post(guard, schemaValidate, treeController.createTree).get(guard, treeController.getTrees);
router.route('/myTree').get(guard, treeController.getMyTree).post(guard, treeController.saveMyTree);
router.route('/:id')
    .get(guard, treeController.getTreeById)
    .patch(guard, schemaValidate, treeController.updateTree)
    .delete(guard, treeController.deleteTree)
    .post(guard, treeController.joinToTree);

router.route('/exit/:id').delete(guard, treeController.exitFromTree);
router.route('/:id/users/:user_id').delete(guard, isTreeOwner, treeController.deleteUserFromTree);

module.exports = router;