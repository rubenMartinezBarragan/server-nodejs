import LoanModel from '../schemas/loan.schema.js';
import { getGame } from './game.service.js';
import { getClient } from './client.service.js';

export const getLoansPageable = async (game, client, date, page, limit, sort) => {
    const sortObj = {
        [sort?.property || 'name']: sort?.direction === 'DESC' ? 'DESC' : 'ASC'
    };

    try {
        var find = {};

        if(game)
            find = { game: game };

        if(client)
            find = { client: client };

        if(date)
            find = { $and: [{dateLoan: {$lte: new Date(date)}}, {dateReturn: {$gte: new Date(date)}}] };

        if(game && client)
            find = { $and: [{game: game}, {client: client}] };

        if(game && date)
            find = { $and: [{game: game}, {dateLoan: {$lte: new Date(date)}}, {dateReturn: {$gte: new Date(date)}}] };

        if(client && date)
            find = { $and: [{client: client}, {dateLoan: {$lte: new Date(date)}}, {dateReturn: {$gte: new Date(date)}}] };

        if(game && client && date)
            find = { $and: [{game: game}, {client: client}, {dateLoan: {$lte: new Date(date)}}, {dateReturn: {$gte: new Date(date)}}] };
        
        const options = {
            page: parseInt(page) + 1,
            limit,
            populate : [
                {
                  path : 'game'
                },
                {
                  path : 'client'
                }
            ],
            sort: sortObj
        };

        return await LoanModel.paginate(find, options);
    } catch (e) {
        throw Error('Error fetching loans page');
    }    
}

export const createLoan = async (data) => {
    var gameLoan;
    var numberGame;

    try {
        const game = await getGame(data.game.id);
        if (!game) {
            throw Error('There is no game with that Id');
        }

        const client = await getClient(data.client.id);
        if (!client) {
            throw Error('There is no client with that Id');
        }

        const loan = new LoanModel({
            ...data,
            game: data.game.id,
            client: data.client.id,
        });

        //Inicio validacion: 'El periodo de prestamo maximo solo puede ser de 14 dias'
        const firstDate = new Date(data.dateLoan);
        const secondDate = new Date(data.dateReturn);

        const firstDateInMs = firstDate.getTime();
        const secondDateInMs = secondDate.getTime();

        const differenceBtwDates = secondDateInMs - firstDateInMs;

        const aDayInMs = 24 * 60 * 60 * 1000;

        const daysDiff = Math.round(differenceBtwDates / aDayInMs);

        if(daysDiff > 14)
            throw Error("El periodo de préstamo máximo solo puede ser de 14 días");
        
        //Inicio validacion: 'El mismo juego no puede estar prestado a dos clientes distintos en un mismo dia'
        gameLoan = true;

        const specGame = await LoanModel.find({ $and: [{game: data.game.id}, {dateLoan: {$lte: new Date(data.dateLoan)}}, {dateReturn: {$gte: new Date(data.dateReturn)}}] });
        
        specGame.forEach((p) => {
            if (!p.client.equals(data.client.id))
                gameLoan = false;
        });

        if (!gameLoan)
			throw Error("El mismo juego no puede estar prestado a dos clientes distintos en un mismo día");

        //Inicio validacion: 'Un mismo cliente no puede tener prestados mas de 2 juegos en un mismo dia'
        gameLoan = true;
		numberGame = 0;

        const specClient = await LoanModel.find({ $and: [{client: data.client.id}, {dateLoan: {$lte: new Date(data.dateLoan)}}, {dateReturn: {$gte: new Date(data.dateReturn)}}] });
        
        specClient.forEach((p) => {
            numberGame++;

			if (numberGame >= 2)
				gameLoan = false;
        });

        if (!gameLoan)
			throw Error("Un mismo cliente no puede tener prestados más de 2 juegos en un mismo día");

        //Guardar prestamo
        return await loan.save();
    } catch (e) {
        throw Error(e);
    }
}

export const deleteLoan = async (id) => {
    try {
        const loan = await LoanModel.findById(id);
        if (!loan) {
            throw 'There is no loan with that Id';
        }
        
        return await LoanModel.findByIdAndDelete(id);
    } catch (e) {
        throw Error(e);
    }
}

export const getLoan = async (id) => {
    try {
        return await LoanModel.findById(id);
    } catch (e) {
        throw Error('There is no loan with that Id');
    }
}