import mongoose from "mongoose" 

const dbConnection = () =>{

    const url ="mongodb+srv://ho:26290357r@cluster0.e5jrf.mongodb.net/go"
   
      const db = mongoose.connect(url)
      .then(() =>{
          console.log('db connection perfect')
      }).catch(() =>{
          console.log('error en connection')
      })

      return db
}

export default dbConnection