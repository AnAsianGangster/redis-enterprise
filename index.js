/**
* redis demo using js
*/
const axios = require('axios');
const express = require('express');
const redis = require('redis');

/* constants */
const PORT = 3000;
const REDIS_URL = `redis://*.*.*.*:*`
const REDIS_ENTERPRISE_URL = `redis://*.*.*.*:*`

const app = express();

/* create redis client and connects to it */
let redisClient;
(async () => {
   redisClient = redis.createClient({
       url: REDIS_URL
   });
   redisClient.on('error', (error) => console.log(`Error: ${error}`));
   await redisClient.connect();
})();

/* create redis client and connects to it */
let redisEnterpriseClient;
(async () => {
   redisEnterpriseClient = redis.createClient({
       url: REDIS_ENTERPRISE_URL
   });
   redisEnterpriseClient.on('error', (error) => console.log(`Error: ${error}`));
   await redisEnterpriseClient.connect();
})();

/* push 1-100 to redis open source */
async function pushData(req, res) {
   for (let i = 0; i < 100; i++) {
       await redisClient.set(i + "key", i);
   }
   res.send({ "result": "OK" });
}

/* get from redis enterprise */
async function getData(req, res) {
   let results = []
   for (let i = 99; i >= 0; i--) {
       let keyname = i + 'key'
       const result = await redisEnterpriseClient.get(keyname);
       results.push({
           key: keyname,
           value: result
       })
   }
   res.send(results);
}

/* random int helper */
function randomIntFromInterval(min, max) {
   return Math.floor(Math.random() * (max - min + 1) + min)
}

/* hset 1-50 person to redis open source */
async function pushPerson(req, res) {
   for (let i = 0; i < 50; i++) {
       redisClient.HSET("person" + i, "name", "name-" + i)
       redisClient.HSET("person" + i, "email", "email-" + i)
       redisClient.HSET("person" + i, "age", randomIntFromInterval(25, 71))
   }
   res.send({ "result": "OK" })
}

/* hget from redis enterprise with condition */
async function getPerson(req, res) {
   condition = [5 ,12, 26, 32, 40]
   let results = []
   for (let i = 50; i >= 0 && condition.includes(i); i--) {
       let keyname = 'person' + i
       const name = await redisEnterpriseClient.HGET(keyname, "name-" + i);
       const email = await redisEnterpriseClient.HGET(keyname, "email-" + i);
       const age = await redisEnterpriseClient.HGET(keyname, "age");
       results.push({
           key: keyname,
           name: name,
           email: email,
           age: parseInt(age)
       })
   }
   res.send(results);
}

/* hget from reids enterprise with condition */
async function getPersonAgeRange(req, res){
   let results = []
   for (let i = 50; i >= 0; i--) {
       let keyname = 'person' + i
       const name = await redisEnterpriseClient.HGET(keyname, "name-" + i);
       const email = await redisEnterpriseClient.HGET(keyname, "email-" + i);
       const age = await redisEnterpriseClient.HGET(keyname, "age");
       if(parseInt(age) >= 30 && parseInt(age) <= 45){
           results.push({
               key: keyname,
               name: name,
               email: email,
               age: parseInt(age)
           })
       }
   }
   res.send(results);
}

/* app route */
app.get('/push-data', pushData)
app.get('/get-data', getData)
app.get('/push-person', pushPerson)
app.get('/get-person', getPerson)
app.get('/get-person-age-range', getPersonAgeRange)

app.listen(PORT, () => {
   console.log(`demo services listening on ${PORT}`);
});
