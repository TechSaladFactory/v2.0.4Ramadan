
const dotenv = require("dotenv")
dotenv.config({ path: "config.env" })

const globalErorr = (err, req, res, next) => {
    if (process.env.NODE_ENV === "development") {
        response_SendingDevelopingMode(err, res)
    } else if (process.env.NODE_ENV === "production") {
        response_SendingProductionMode(err, res)
    }

}
const tokenMassage=(message)=>{

    if(message==="invalid signature"){
        return "invalid token, please login ...";
    }else if(message==="jwt expired"){
        return "The token is expired, login and get another one";

    }else{
        return message;
    }
}
const response_SendingDevelopingMode = (err, res) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || "error";
    res.status(err.statusCode).json({
        message: tokenMassage(err.message),
        error: err,
        status: err.status,
        stack: err.stack
    });

}


const response_SendingProductionMode = (err, res) => {
  
    err.statusCode = err.statusCode || 500
    err.status = err.status || "error";
    res.status(err.statusCode).json({
        message: tokenMassage(err.message),
        status: err.status,
        statusCode: err.statusCode
    });

}
module.exports = globalErorr 