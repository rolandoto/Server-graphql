import {ApolloServer,UserInputError, gql} from 'apollo-server'
import {v1 as uuid}  from 'uuid'
import axios from 'axios'
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

type  Book {
    name: String!
    url:String
}
type Query{
    personCount:Int!
    allPerson(phone:Yesno):[Persone!]
    findPerson(name:String!):Persone
    books:[Book]
}
type Mutation {
    addperson(
        name:String!
        vote:Int!
        phone:String!
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
 buscar(
    name:String!
    ):Persone

buscarPerson(name:String!):Persone

buscarId(
    name:String!
    url:String!
    ):Book
    }
`
//lo que vamos retornar 

//enum  para 
const resolverse ={
    Query:{
        personCount:() => persona.length,
        allPerson: (root,args) => {
            if(!args.phone)  return  persona

            return persona.filter(person =>{
                return args.phone =='YES'? person.phone : !person.phone
            })
        },
        findPerson:(root,args) =>{
            const {name} = args
            return persona.find((index) =>index.name == name)
        },
        books: async   () => {
        const {data} = await axios.get('https://pokeapi.co/api/v2/pokemon/')
        const {results} = data
        return results
        },

    },
    Mutation :{
        addperson:(root,args) =>{
            if(persona.find((index) => index.name == args.name)){
                throw new UserInputError('Name must  be unica',{
                    invalidArgs:args.name
                })
            }else {
                const persons = { ...args, id: uuid() }
                
                persona.push(persons)
                return persons 
            }
       },
       editpersona: (root,args) =>{
           //aqui busca un person con el  findIndex
            const personIndex = persona.findIndex((index) => index.name ==args.name)
            if(personIndex ==-1) return null
            
            const person = persona[personIndex]

            const updatePerson ={...person,phone:args.phone}
            //aqui se me va a actualizar de acuerdo al findIndex que le estamos pasando 
            //se me va a actualizar de acuerdo al updatePerson
           const t = persona[personIndex]= updatePerson
            return t
       },

       editall:(root,args)=>{
            const personaIndex = persona.findIndex((index) =>  index.id == args.id)
            
            if(personaIndex ==-1) return null

            const person = persona[personaIndex]
            
            const pers = {...person,phone:args.phone,name:args.name,city:args.city}
            persona[personaIndex] = pers
            return pers 
       },
       
       buscar: (root,args) =>{
            
            const totalfind = persona.find(index => index.name = args.name)

            if(!totalfind) return null
            
            return totalfind
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
        deletePersonas:(root,args) =>{
            const {name} = args
        
             persona =persona.filter((message) => message.id !==args.id);
            
            return persona;
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
    }
}
//aqui definimos  los resovers
const server = new ApolloServer ({
    resolvers:resolverse,
    typeDefs
})

server.listen().then(({url}) =>{
    console.log(`reacdy at ${url}`)
})
