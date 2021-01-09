const https = require('http')
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
const serverPort = 8080

const loginData = JSON.stringify({'username': 'testuser','password': 'testpass'})
const ip = '192.168.1.42'
const port = 8000
const loginOptions = {
  hostname: ip,
  port: port,
  path: '/api/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
}

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

/* HTTP client to make request to the interop server */
class HttpClient {
  ip
  port
  loginOptions
  teamOptions
  data
  cookie
  logged = false
  // Constructors logs the client
  constructor(ip,port,loginOptions,creds){
    this.ip = ip
    this.port = port
    this.loginOptions = loginOptions
    
    const req = https.request(this.loginOptions, (function(res) { 
      console.log(`statusCode: ${res.statusCode}`)
      console.log(res.headers['set-cookie'])
      this.cookie = res.headers['set-cookie']
      this.teamOptions = {
        hostname: this.ip,
        port: this.port,
        path: '/api/teams',
        method: 'GET',
        headers: {
          'Cookie': this.cookie[0]
        }
      }
      this.logged = true
      res.on('data', d => {
        process.stdout.write(d);
      })
    }).bind(this))
    req.write(creds);
    req.end();
  }
  // gets team information, waits first for login confirmation
  async getInformation(){
    while(!this.logged){
      await sleep(500)
    }
      const req = https.request(this.teamOptions, res => {
        console.log(`statusCode: ${res.statusCode}`)
        res.on('data', d => {
          process.stdout.write(d);
          this.data = d
        })
      })
      req.end();
  }

  publishTelemetry(telemetryData){
    var testOptions = {
      hostname: ip,
      port: port,
      path: '/api/telemetry',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': telemetryData.length,
        'Cookie': this.cookie[0]
      }
    }

    const req = https.request(testOptions, (function(res) { 
    console.log(`statusCode: ${res.statusCode}`)
    res.on('data', d => {
      process.stdout.write(d);
    })

  }).bind(this))
  req.write(telemetryData);
  req.end();
  }

}

var client = new HttpClient(ip,port,loginOptions,loginData);

var test = false

// SERVER
app.get('/api/teams', (req, res) => {
  client.getInformation()
  res.send(client.data)
})
var lat = -76.5301
var lon = 39.1817

app.get('/test/start', (req,res) => {
  if(!test){
    test = true
    setInterval(function(){
      client.publishTelemetry(JSON.stringify({
        "latitude": lat,
        "longitude": lon,
        "altitude": 50,
        "heading": 90
      }))
      lat +=0.0001
      lon +=0.0001
    },1000)
    res.send('test started')
  }else{
    res.send('test already ongoing')
  }
})

app.get('/test/end', (req,res) => {
  if(test){
    test = false
  }
  res.send('test stopped')
})

app.listen(serverPort, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})







