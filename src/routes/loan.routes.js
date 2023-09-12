import { Router } from 'express';
import { check } from 'express-validator';
import validateFields from '../middlewares/validateFields.js';
import { getLoansPageable, createLoan, deleteLoan } from '../controllers/loan.controller.js';
const loanRouter = Router();

loanRouter.post('/', [
    check('pageable').not().isEmpty(),
    check('pageable.pageSize').not().isEmpty(),
    check('pageable.pageNumber').not().isEmpty(),
    validateFields
], getLoansPageable);

loanRouter.post('/save', [
    check('game.id').not().isEmpty(),
    check('client.id').not().isEmpty(),
    check('dateLoan').not().isEmpty(),
    check('dateReturn').not().isEmpty(),
    validateFields
], createLoan);

loanRouter.delete('/:id', deleteLoan);

export default loanRouter;