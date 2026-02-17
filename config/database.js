const mongoose = require("mongoose")

const DB_Url = process.env.DB_URL
const db_connection = () => {
    mongoose.connect(DB_Url).then((connect) =>
        console.log(`DB is Connected ${connect.connection.host} ...`)
    )
  //  .catch((erorr) => {
   //     console.error(`DB Erorr === ${erorr}`)
     //   process.exit(1)
   // })
};
module.exports=db_connection;