console.log('Hello World')
var express = require('express');
var app = express();
var eenv = require('dotenv').config()
const port = process.env.PORT || 3001;
const mongoose = require("mongoose");
const Data = require('./data')
var dburi = process.env.dburi
const cors = require('cors');



var acceptedUrlArray = process.env.aAurl
console.log('acceptedUrlArray')
console.log(acceptedUrlArray)
app.use(function (req, res, next) {
      console.log('use started')

      const origin = req.headers.origin;
      var accept = ''


      if (acceptedUrlArray.includes(origin)) {
            accept = origin



            res.header("Access-Control-Allow-Origin", origin);
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            console.log('Origin Has Been set to:')
            console.log(origin)
            next();
      } else {
            console.log('Origin Erro. check :')
            console.log(origin)
      }

});
// var acceptedUrl = process.env.aurl
// app.use(function (req, res, next) {
//       res.header("Access-Control-Allow-Origin", 'http://127.0.0.1:8080/');
//       res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//       next();
// });

app.get('/test', function (req, res) {
      console.log('test')
      console.log(req.headers.origin)
      var org = req.headers.origin
      return res.status(200).json({
            status: 'success',
            time: Date(Date.now()),
            origin: org
      });
})

app.get('/addEmail', async function (req, res) {
      if (req.query.email == undefined) {
            return res.status(501).json({
                  status: 'error'
            });
      }
      await dbConnect();

      try {


            var newData = {
                  email: req.query.email,
            }

            Data.create(newData)

            res.send('New User OK!');

      } catch (error) {
            res.send('New User error!');
      }
});


app.get('/addAddress', async function (req, res) {
      if (req.query.address == undefined) {
            return res.status(501).json({
                  status: 'error'
            });
      }
      newAddress = req.query.address
      await dbConnect();
      console.log(' Add Address Start @@@@')
      try {

            Data.findOne({ address: newAddress }).then(async (uCode) => {
                  console.log('FindOne Res: ')
                  console.log(uCode)
                  if (uCode == null) {

                        var code = await getACode();
                        if (code == '000000') {
                              return res.status(501).json({
                                    status: 'error'
                              });
                        }
                        var newData = {
                              address: req.query.address,
                              code: code
                        }
                        try {
                              var result = await Data.create(newData);
                              console.log('===========================================')
                              console.log('===========================================')
                              console.log('Save Result:')
                              console.log(result)
                              return res.status(200).json({
                                    status: 'success',
                                    code: code
                              });
                        } catch (error) {
                              console.log('===========================================')
                              console.log('===========================================')
                              console.log('Save Result:')
                              console.log('ERROR: ')
                              console.log(error)
                        }
                  }
                  else {
                        return res.status(200).json({
                              status: 'success',
                              code: uCode.code
                        });
                  }

            })

            // , (res, err) => {
            //       console.log('######################################################')
            //       console.log(res)
            //       console.log(err)
            // })

            // if (newA == undefined) {





            // } else {

            //       console.log('newA is:')
            //       console.log(newA.address)
            //       console.log(newA.code)
            //       return newA.code
            // }





      } catch (error) {

            return res.status(501).json({
                  status: 'error',
                  errorText: 'Could not fetch data from database. Try Later'
            });
      }
});



async function dbConnect() {
      return new Promise((resolve, reject) => {
            console.log('dbConnect start')
            if (mongoose.connection.readyState == 1) {
                  console.log('db is Connected')
                  resolve(true)
            } else {
                  var counter = 0;
                  mongoose.connect(dburi)
                  var interval = setInterval(() => {
                        if (mongoose.connection.readyState == 1) {
                              clearInterval(interval)
                              console.log('db has been Connected')
                              resolve(true)
                        }
                        counter++
                        if (counter > 30) {
                              console.log('db Connect Failed')
                              clearInterval(interval)
                              resolve(false)
                        }
                        console.log('DB Conneting attempt ' + counter
                        )
                  }, 1000)
            }
      })
}


app.get('/getAll', async function (req, res) {
      console.log(req.query.passkey)
      console.log(process.env.masterPassword)
      if (req.query.passkey == process.env.masterPassword) {
            await dbConnect();
            var fuser = await Data.find()

            return res.status(200).json({
                  status: 'success',
                  allUsers: fuser
            });
      } else {
            return res.status(200).json({
                  status: 'success',
                  data: {
                        code: null,
                  }

            });
      }

});


app.get('/getAddresses', async function (req, res) {
      if (req.query.passkey == process.env.masterPassword) {
            await dbConnect();
            var fuser = await Data.find({
                  address: {
                        "$ne": null
                  }
            })

            var addresses = new Array()
            fuser.forEach(element => {
                  addresses.push(element.address)
            });
            return res.status(200).json({
                  status: 'success',
                  addresses: addresses
            });
      } else {
            return res.status(200).json({
                  status: 'success',
                  data: {
                        address: null,
                  }

            });
      }

});



app.get('/getEmails', async function (req, res) {
      console.log(req.query.passkey)
      console.log(process.env.masterPassword)
      if (req.query.passkey == process.env.masterPassword) {
            await dbConnect();
            var fuser = await Data.find({
                  email: {
                        "$ne": null
                  }
            })
            console.log('The fetched user:')
            console.log(typeof (fuser))
            var emails = new Array()
            fuser.forEach(element => {
                  emails.push(element.email)
            });
            return res.status(200).json({
                  status: 'success',
                  emails: emails
            });
      } else {
            return res.status(200).json({
                  status: 'success',
                  data: {
                        code: null,
                  }

            });
      }

});



app.get('/', function (req, res) {
      res.send('Hello World!');
});


app.listen(port, async () => {
      console.log(`Example app listening on port ${port}!`);
});

function generateCode() {
      var t = ''
      var v = ''
      for (let i = 0; i < 6; i++) {
            let x = Math.floor(Math.random() * 10)

            if (i == 0) {
                  if (x < 1) x = Math.floor(Math.random() * 10)
                  if (x < 1) x = Math.floor(Math.random() * 10)
                  if (x < 1) x = 1
            }
            if (i > 2) v = x

            if (i > 3 && v == x) {
                  if (x < 1) x = Math.floor(Math.random() * 10)
                  if (x < 1) x = Math.floor(Math.random() * 10)
                  if (x < 1) x = 1
            }

            t += x.toString()
      }
      return t
}


async function getACode() {
      var x = generateCode()
      for (let i = 0; i < 100; i++) {
            var exist = await Data.findOne({ code: x })
            if (exist == undefined) {
                  return x
            }
      }
      return '000000'
}
