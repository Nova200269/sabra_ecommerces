import Currency from "../models/currency.js";
import HttpError from "../utils/error/httpError.js";
import currency from "../models/currency.js";

  
//Add By Mohamad 

/*
@des get all currencies
@route  /currencies
@method Get
@access public
*/
export const getAllCurrencies =
    async (req, res, next) => {
        try {
            const result = await Currency.find();
            const count = await Currency.count();
            res.status(201).json({
                status: "success",
                count:count,
                data: result,
            });
        } catch (error) {
            return next(error);
        }
    };


    //Add By Mohamad 

/*
@des getCurrenciesById
@route  /currencies/:id
@method Get
@access public
*/
export const getCurrenciesById =
async (req, res, next) => {
    try {
        const result = await Currency.findById(req.params.id);
        if(!result) throw new HttpError("invalid currency id", 400);
        res.status(201).json({
            status: "success",
            data: result,
        });
    } catch (error) {
        return next(error);
    }
};

    //Add By Mohamad 

/*
@des create new currency
@route  /currencies
@method POST
@access privet
*/
export const createCurrencies =
async (req, res, next) => {

    if(req.user.role==="admin"){
        try {
            let currencyModel = Currency(
                {
                code:req.body.code,
                exchangeToUSD:req.body.exchangeToUSD,
                }
        );
            
            const isCurrency = await Currency.findOne({
               code: { $eq: req.body.code }
              
            });
            if (isCurrency) throw new HttpError("this currency already excists", 400);
    
            const result = await currencyModel.save();
    
            res.status(201).json({
                status: "success",
                data: result,
            });
        } catch (error) {
            return next(error);
        }
    }else{
        console.log('==not==admin');
        throw new HttpError("Invaled role", 400)
    }


   
};




    //Add By Mohamad 

/*
@des update  currency
@route  /currencies/:id
@method PUT
@access privet
*/
export const updateCurrencies =
async (req, res, next) => {
    if(req.user.role==="admin"){
        try {      
            const isCurrency = await Currency.findById(req.params.id);
         

            if (!isCurrency) throw new HttpError("currency not fond", 400);
            const result = await currency.findByIdAndUpdate(req.params.id,{
                $set:{
                    code:req.body.code,
                    exchangeToUSD:req.body.exchangeToUSD,
                    }
            },{new:true})
            res.status(201).json({
                status: "success",
                data: result,
            });
        } catch (error) {
            return next(error);
        }
    }else{
        console.log('==not==admin');
        throw new HttpError("Invaled role", 400)
    }

};


    //Add By Mohamad 

/*
@des delete  currency
@route  /currencies/:id
@method DELETE
@access privet
*/
export const deleteCurrencies =
async (req, res, next) => {

    if(req.user.role==="admin"){
        try {        
            const isCurrency = await Currency.findById(req.params.id);
            if (!isCurrency) throw new HttpError("currency not fond", 400);
            const result = await currency.findByIdAndUpdate(req.params.id,{
                $set:{
                    code:req.body.code,
                    exchangeToUSD:req.body.exchangeToUSD,
                    }
            },{new:true})
            res.status(201).json({
                status: "success",
                data: result,
            });
        } catch (error) {
            return next(error);
        }
    }else{
        console.log('==not==admin');
        throw new HttpError("Invaled role", 400)
    }
    try {        
        const isCurrency = await Currency.findById(req.params.id);
        if (!isCurrency) throw new HttpError("currency not fond", 400);
        const result = await currency.findByIdAndDelete(req.params.id);
        res.status(201).json({
            status: "success",
        });
    } catch (error) {
        return next(error);
    }
};