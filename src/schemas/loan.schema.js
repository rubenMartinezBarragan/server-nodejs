import mongoose from "mongoose";
const { Schema, model } = mongoose;
import normalize from 'normalize-mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const loanSchema = new Schema({
    game: {
        type: Schema.Types.ObjectId,
        ref: 'Game',
        require: true
    },
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    dateLoan: {
        type: Date,
        required: true
    },
    dateReturn: {
        type: Date,
        required: true,
        validate: [dateValidator, 'La fecha de fin NO puede ser anterior a la fecha de inicio']
    }
});

function dateValidator(value) {
    return this.dateLoan <= value;
}

loanSchema.plugin(normalize);
loanSchema.plugin(mongoosePaginate);

const LoanModel = model('Loan', loanSchema);

export default LoanModel;
