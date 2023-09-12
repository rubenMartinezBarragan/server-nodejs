import * as LoanService from '../services/loan.service.js';

export const getLoansPageable = async (req, res) => {
    const gameToFind = req.query?.idGame || null;
    const clientToFind = req.query?.idClient || null;
    const dateToFind = req.query?.dateSearch || null;

    const page = req.body.pageable.pageNumber || 0;
    const limit = req.body.pageable.pageSize || 5;
    const sort = req.body.pageable.sort || null;

    try {
        const response = await LoanService.getLoansPageable(gameToFind, clientToFind, dateToFind, page, limit, sort);
        res.status(200).json({
            content: response.docs,
            pageable: {
                pageNumber: response.page - 1,
                pageSize: response.limit
            },
            totalElements: response.totalDocs
        });
    } catch (err) {
        res.status(400).json({
            msg: err.toString()
        });
    }
}

export const createLoan = async (req, res) => {
    try {
        const loan = await LoanService.createLoan(req.body);
        res.status(200).json({
            loan
        });
    } catch (err) {
        res.status(400).json({
            msg: err.toString()
        });
    }
}

export const deleteLoan = async (req, res) => {
    const loanId = req.params.id;
    try {
        const deletedLoan = await LoanService.deleteLoan(loanId);
        res.status(200).json({
            client: deletedLoan
        });
    } catch (err) {
        res.status(400).json({
            msg: err.toString()
        });
    }
}