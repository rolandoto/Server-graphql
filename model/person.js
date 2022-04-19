import mongoose from "mongoose"


const person =mongoose.Schema({
  name:{
    type:String,
  },
  phone:{
    type:String
  },
  streep:{
    type:String
  },
  city:{
    type:String
  }
})


export default mongoose.model("Person",person)

