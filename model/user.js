import mongoose  from "mongoose"

const user =mongoose.Schema({
  username:{
    type:String
  },
  friends:[
    {
      ref:"Person",
      type:mongoose.Schema.Types.ObjectId
    }
  ]
})


export default mongoose.model("User",user)


