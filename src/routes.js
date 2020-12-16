const express = require('express') 
const fetch = require("node-fetch");

const router = express.Router();
const apiCovid = 'https://brasil.io/api/dataset/covid19/caso/data/'
const apiMestra ='https://us-central1-lms-nuvem-mestra.cloudfunctions.net/testApi/'
const token = 'cd06accc7cba9e0b48b4d3106f3ea4359f593725'

router.get('/', async (req, res) => {
        const{state, dateStart, dateEnd} = req.query;

        const covid = await fetch(
            `${apiCovid}?state=${state}&date=${dateStart}`,
            {
              method: 'get',
              headers: {
                Authorization: `Token ${token}`
            }})
            .then((res) => {return res.json()})
            .then((data) => {return data.results})
            .catch(function(err){
                console.error('Não foi possível achar a informação', err)
              });

            let nextId = 0
            const cities = covid.map(({city,confirmed,estimated_population}) => {
                if(confirmed!== null && estimated_population !== null) {
                    return { 
                    nomeCidade : city,
                    percentualDeCasos : ((confirmed/estimated_population)*100).toFixed(2)
                }
            }})
            .sort((a, b) => b.percentualDeCasos-a.percentualDeCasos)
            .slice(0,10)

            const citiesFinal = cities.map(item => {
                return {
                    Id: nextId++,
                    nomeCidade: item.nomeCidade,
                    percentualDeCasos: item.percentualDeCasos
                }
            }) 

            res.send(citiesFinal);

            const headers = {
                "MeuNome": "Marcelo Vieira Alves de Andrade"
            };

            const topCities = await citiesFinal.map(async(city)=>{
                await fetch(`${apiMestra}`,
                {
                    method: 'post',
                    headers: headers,
                    body: city
                  })
                  .then((res) => {return res.json()})
                  .then((data) => {return data})
                  .catch(function(err){
                      console.error('Não foi possível salvar a informação', err)
                    });
            });

})

module.exports = router;