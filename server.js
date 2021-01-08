const https = require('http')
const express = require('express')
const app = express()
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
    
    const req = https.request(this.loginOptions, (function(res) { // WRONG THIS
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

}

var client = new HttpClient(ip,port,loginOptions,loginData);

// SERVER
app.get('/api/teams', (req, res) => {
  client.getInformation()
  res.send(client.data)
})

app.listen(serverPort, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


// MAIN
client.getInformation()







