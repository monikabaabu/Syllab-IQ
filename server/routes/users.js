const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User CRUD routes
router.post('/', userController.createUser);
router.post('/bulk/create', userController.bulkCreateUsers);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// User links routes - by roll number
router.get('/links/:rollNumber', userController.getUserLinksByRollNumber);
router.put('/links/:rollNumber', userController.updateUserLinksByRollNumber);
router.put('/links/bulk/update', userController.bulkUpdateUserLinks);

// User links routes - by user ID
router.get('/:userId/links', userController.getUserLinksById);
router.put('/:userId/links', userController.updateUserLinksById);

module.exports = router;
