require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const POKEDEX = require('./pokedex.json')

console.log(process.env.API_TOKEN)

const app = express();

app.use(morgan('dev'))

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

app.use(function validateBearerToken(req, res, next){
  
  
  const apiToken = process.env.API_TOKEN
  const authToken = req.get('Authorization')
  
  console.log('validate bearer token middleware')
    //tells express that to move to next middleware IF WE DID NOT INCLUDE next() the request would just hang here and eventually time out.
  if(!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request'})
  }

  next()

})




//sets up /types endpoint and returns the list above of valid pokemon types
app.get('/types', function handleGetTypes(req, res) {
  res.json(validTypes)
})



app.get('/pokemon', function handleGetPokemo(req, res){
  
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



const PORT = 8000

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
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