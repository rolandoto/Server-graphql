import {ApolloServer,UserInputError, gql, AuthenticationError} from 'apollo-server'
import {v1 as uuid}  from 'uuid'
import axios from 'axios'
import db from "./db.js"
import person from './model/person.js'
import User from "./model/user.js"
import jwt from "jsonwebtoken"

db()    

const JWR_SECRECT ="AQUI_TU_PALABRA_SECRETA"

//LAR VERSION DE APOLLO SERVER Y GRAPHQL TIENEN QUE SER 
//"apollo-server": "^2.5.0-alpha.2",
// "graphql": "^14.1.1",

//const ray =['rolanod','ribaldo','ronald']
//   aqui me da la longitud de lo que esta buscando
//   const result = ray.findIndex((index) =>  index =='ribaldo')
//  aqui me dice si el valor es undefined que es -1 por fa return null
//  if(result ==-1) return <h1>no hay nada</h1>
// console.log(person)

//findIndex en este caso sino lo encuentra es -1 para finIndex
//uuid  nos brinda un id unico 

//consultas anidadas 
/* 
query {
  personCount
  dataperson:allPerson{
    id
    name
    phone
  }
 
  datapersonPhone:allPerson(phone:NO){
    name
    phone
    phone
  }
}
*/

let persona  =[
    {
        age:'1',
        name:'rolando',
        phone:'3202322',
        streep:'calle fronnted',
        city:'barcelona',
        vote:1,
        id:"1"
    },
    {   
        age:'2',
        name:'camilo',
        phone:'3202322',
        streep:'calle fronnted',
        city:'barcelona',
        vote:1,
        id:"2"
    },
]

// Cuando se coloca ! es porque es un campo requerido

const typeDefs = gql`

enum Yesno {
    YES
    NO
}

type Adress {
    streep:String!
    city:String!
}

type Persone {
    name:String!
    phone:String!
    addres:Adress!
    vote:Int!    
    id:ID!
    cardring:Int!
}

type User {
    username:String!
    friends:[Persone]!
    id:ID!
}

type Token {
    value:String!
}

type  Book {
    name: String!
    url:String
}
type Query{
    personCount:Int!
    allPerson(phone:Yesno):[Persone!]
    findPerson(name:String!):Persone
    books:[Book]
    me:User
}
type Mutation {

    addperson(
        name:String!
        phone:String!
        streep:String!
        city:String!
        ):Persone  
    
    editpersona(
        name:String!
        phone:String!
    ):Persone
    editall(
        id:String!
        name:String!
        phone:String!
        city:String!
    ):Persone

   deletePersonas(id:String!):[Persone!]
         
   deletePersonasAll:[Persone!]
 
   findName(
    name:String!
    ):Persone

buscarPerson(name:String!):Persone

buscarId(
    name:String!
    url:String!
    ):Book

createUser(
    username:String!
):User

login(
    username:String!
    password:String!
):Token

addAsFriends(
    name:String!
):User

}   
`

//lo que vamos retornar 

//enum  para    
const resolverse ={
    Query:{
        personCount:() => person.collection.countDocuments(),
        allPerson:async (root,args) => {
            //if(!args.phone)  return  persona

            //return persona.filter(person =>{
            //    return args.phone =='YES'? person.phone : !person.phone
            //})
        
        if(!args.phone)return person.find({})
        
        return await  person.find({phone:{$exists:args.phone === "YES"}})
        },
        findPerson:(root,args) =>{
            const {name} = args

            return person.findOne({name})
        },
        books: async   () => {
        const {data} = await axios.get('https://pokeapi.co/api/v2/pokemon/')
        const {results} = data
        return results
        },

        me:(root,args,context) =>{
            return context.currentUser
        }
        
    },
    Mutation :{
        addperson:async (root,args,context) =>{
            const {currentUser} =context

            const Person =  new person({...args})

            if(!currentUser)  throw new AuthenticationError("no authenticated")
        
            try {
            
            await Person.save()

            currentUser.friends = currentUser.friends.concat(Person)

            await  currentUser.save()      
                
            } catch (error) {
                
            }
           
       },
       editpersona:async (root,args) =>{
        const Person = await person.findOne({name:args.name})
        Person.phone = args.phone
        return Person.save()
           //aqui busca un person con el  findIndex
           // const personIndex = persona.findIndex((index) => index.name ==args.name)
           // if(personIndex ==-1) return null
            
           // const person = persona[personIndex]

           // const updatePerson ={...person,phone:args.phone}
            //aqui se me va a actualizar de acuerdo al findIndex que le estamos pasando 
            //se me va a actualizar de acuerdo al updatePerson
           //const t = persona[personIndex]= updatePerson
           // return t
       },

       editall:async(root,args)=>{
    
        const Person= await person.findOne({name:args.name})

      
        try {
               const t= await person.findByIdAndUpdate(
                Person.id,
                {
                  $set: args,
                },
                { new: true }
              );

              return t

            
        } catch (error) {
            throw new UserInputError("no esta disponible",{
                invalidArgs:args
            })
        }
        
        
        //const personaIndex = persona.findIndex((index) =>  index.id == args.id)
            
       //     if(personaIndex ==-1) return null

        //    const person = persona[personaIndex]
            
        //    const pers = {...person,phone:args.phone,name:args.name,city:args.city}
       //     persona[personaIndex] = pers
       //     return pers 
      
       },
       
       findName: async(root,args) =>{
            const  {name} = args
            const findperson = await person.findOne({name})

            return  findperson
        },
       // marta cardona
        buscarId: async(root,args) =>{
        const {data} = await  axios.get('https://pokeapi.co/api/v2/pokemon/')
        const {results} = data  
        
        const total = results.findIndex(index => index.name == args.name)
        
        if(total ==-1) return null
            
        const persona =results[total]
        //esto es como si fuera un for pero para cambiarle el dato
        const re = {...persona,url:args.url}
        
        const to  =results[total] = re
        return to
        
        },
        //eliminar por personas
        deletePersonas: async(root,args) =>{
        
            const {id} =  args

            const Person= await person.findByIdAndDelete(id)
        
            if(!Person) return
           // const {name} = args
            
           // persona =persona.filter((message) => message.id !==args.id);
            
          //  return persona;
        },
        //borrar todo
        deletePersonasAll:()=>{

            persona = persona.filter(person => person.name >0)

            return persona
        },

        buscarPerson:(root,args) =>{
            const index = persona.find(index => index.name == args.name)
            
            if(index){
                index.vote+=1
            }
            
            return index 
        },
        login:async(root,args) =>{
            const user =  await User.findOne({username:args.username})
    
            if(!user || args.password  == "secrect"){
                throw  new UserInputError("wrong credentials")
            }
        const userForToken ={
            username:user.username,
            id:user._id 
        }

        return {
            value: jwt.sign(userForToken,JWR_SECRECT)
        }

        },
        createUser:async(root,args)=>{
            const user = await new User({username:args.username})
    
            return user.save().catch(error =>{
                throw new  UserInputError(error.message,{
                    invalidArgs:args
                })
            })
        },

        addAsFriends: async(root,args,context) =>{
            
            const {currentUser} =context

            if(!currentUser)  throw new AuthenticationError("no authenticated")

            const Person = await person.findOne({name:args.name})

            const nonFriendsLyAlready = person => !currentUser.friends.map(p => p._id).includes(person)
            
            if(nonFriendsLyAlready(Person)){
                currentUser.friends = currentUser.friends.concat(Person)

                await currentUser.save()
            }
        return currentUser
        }
    }, 
    Persone :{
        //aqui es para el campo addres para poder ingresar a la informacion
        //streep, city
        addres :(root) =>{
            return {
                streep: root.streep,
                city: root.city
            }
        }
    }, 
}
//aqui definimos  los resovers
const server = new ApolloServer ({
    resolvers:resolverse,
    typeDefs,
    context:async({req})=>{
        const auth  = req ? req.headers.authorization : null
        if(auth && auth.toLowerCase().startsWith("bearer ")){
            const  token = auth.substring(7)
            const {id} = jwt.verify(token,JWR_SECRECT)
            const currentUser = await User.findById(id).populate("friends")
            return {
                currentUser
            }
        }
    }
})
server.listen().then(({url || 4000 }) =>{
    console.log(`reacdy at ${url}`)
})
