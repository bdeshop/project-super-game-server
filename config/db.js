const mongoose=require("mongoose");

const connectdb=()=>{
         mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
        .then((res)=>{
            console.log("Mongodb Connected....")
        }).catch((err)=>{
            console.log(err.message)
        })
}

module.exports=connectdb;