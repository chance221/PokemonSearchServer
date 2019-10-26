require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet')
const cors = require('cors')
const POKEDEX = require('./pokedex.json')


const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganSetting))

//helmet MUST be before use cors

app.use(helmet())

app.use(cors())

const validTypes = [
  `Bug`, 
  `Dark`, 
  `Dragon`, 
  `Electric`, 
  `Fairy`, 
  `Fighting`, 
  `Fire`, 
  `Flying`, 
  `Ghost`, 
  `Grass`, 
  `Ground`, 
  `Ice`, 
  `Normal`, 
  `Poison`, 
  `Psychic`, 
  `Rock`, 
  `Steel`, 
  `Water`
]
//This is the middleware that handles errors. It catches server errors withour exposing secure data (like tokens)
//Express knows that when middleware has a list of 4 parameters that middleware will be assigned to error handling. 
app.use((error, req, res, next)=>{
  let response
  if( process.env.NODE_ENV === 'production') {
    response = {error: { message: 'server error'}}
  }
  else {
    response = {error} 
  }
  res.statu(500).json(response)
})

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
  
})


app.use(function validateBearerToken(req, res, next){
  
  
  const apiToken = process.env.API_TOKEN
  
  const authToken = req.get('Authorization')
  
  if(!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request'})
  }
  
  //tells express that to move to next middleware IF WE DID NOT INCLUDE next() the request would just hang here and eventually time out.
  next()

})




//sets up /types endpoint and returns the list above of valid pokemon types
app.get('/types', function handleGetTypes(req, res) {
  res.json(validTypes)
})



app.get('/pokemon', function handleGetPokemo(req, res){
  debugger
  let response = POKEDEX.pokemon
  //if a query was provided then filter out the results
  if (req.query.name){
    response = response.filter(pokemon => 
      pokemon.name.toLowerCase().includes(req.query.name.toLowerCase())
    )
  }
  if(req.query.type) {
    response = response.filter(pokemon =>
      pokemon.type.includes(req.query.type) //why can I not use toLowerCase on this?
    )
  }
  res.json(response)
})






/*

For the first time we are going to think about security in our application. 

If we plan on opening this applictation to the public I need to think about a couple of things

1) Do I want unlimited calls to this application? (NO. Opens you up to server DoS attacks)
2) Who do I want to have access to this endpoint?

The easiest solution is to allow a request that contain a valid API token.

When making a request the client should include a valid AUTHORIZATION token in the header

The value of the header will be Bearer ${API_TOKEN}

In no token is provided the server should respone with a "Unauthorized" error using the appropriate code status

So our server application needs to 

1)Look in the header
2)Read the value in the header if it exists
3)Check that the value is a valid API token. 

This is complicated and potentially expensive. For example purposes we will create a simple workaround.
*/