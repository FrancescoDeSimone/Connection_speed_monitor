const spawn = require('child_process').spawn
const express = require('express')
const NoSQL = require('nosql');
const db = NoSQL.load('./database.nosql');


const speedTest =
  () => {
    return new Promise((res, rej) => {
      let stdout = ""
      let menu = spawn("node_modules/speed-test/cli.js", ["--json"])
      menu.stdout.on('data', data => stdout += data.toString())
      menu.stderr.on('data', console.error)
      menu.on('exit', code => {
        if (code !== 0 && code !== 10 && (stdout)) {
          console.error('returned with code ' + code)
          rej(code)
        }
        res(stdout.trim())
      })
    })
  }

const app = express()
const path = require('path');
const router = express.Router();
const port = 3000

app.set('view engine', 'ejs');
app.get('/', (req, res) => {
  db.find().fields('timestamp','download','ping','upload').callback((err, data, len) => {
      res.render('index', {
        timeseries: Buffer.from(JSON.stringify(data),'utf-8').toString('base64')
      })
  });

});

app.listen(port, () => {
  setInterval(async () => {
    console.log("START")
    let d = JSON.parse(await speedTest())
    d = Object.assign({}, {
      timestamp: Date.now()
    }, d)
    console.log(d)
    db.insert(d)
    console.log("STOP")
  }, 30 * 60 * 1000)
  console.log(`Example app listening at http://localhost:${port}`)
})
