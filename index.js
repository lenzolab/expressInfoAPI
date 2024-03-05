console.log('Hello World')
var express = require('express');
var app = express();
var eenv = require('dotenv').config()
const port = process.env.PORT || 3000;
var dburi = process.env.dburi
const cors = require('cors');
var fs = require('fs');
// const { setFlagsFromString } = require('v8');
// const { Promise } = require('mongoose');
// const { setTimeout } = require('timers/promises');

//#region Settings

const codeLength = 4;
const addressDataFilePath = './data/addressCodes.json'

//#endregion




//#region CORS
var acceptedUrlArray = process.env.aAurl
console.log('acceptedUrlArray')
console.log(acceptedUrlArray)
app.use(function (req, res, next) {
      console.log('use started')
      //console.info(req.headers)
      const origin = req.headers.origin || req.headers.host;
      console.log('req origin   : ' + origin) 

      var accept = ''


      if (acceptedUrlArray.includes(origin)) {
            accept = origin



            res.header("Access-Control-Allow-Origin", origin);
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            //console.log('Origin Has Been set to:')
            //console.log(origin)
            next();
      } else {
            console.log('Origin Error. check :')
            console.log(origin)
      }

});
//#endregion

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



app.get('/codefor', async function (req, res) {
      if (req.query.address == undefined) {
            return res.status(501).json({
                  status: 'error',
                  message: 'Address has not been detected.'
            });
      }
      let Address = req.query.address;
      if (Address.length != 42) {
            return res.status(501).json({
                  status: 'error',
                  message: 'Address length is not valid.'
            });
      }
      if (Address[0] != "0" || Address[1] != "x") {
            return res.status(501).json({
                  status: 'error',
                  message: 'Address string is not valid.'
            });
      }

      console.log(' Add Address Start @@@@')
      try {
            var code = await getCodeForAddress(Address)
            return res.status(200).json({
                  status: 'success',
                  address: Address,
                  code: code
            });
      } catch (error) {

            return res.status(501).json({
                  status: 'error',
                  errorText: 'Could not fetch data from database. Try Later'
            });
      }
});

async function getCodeForAddress(adr) {
      var file = fs.readFileSync(addressDataFilePath, 'utf8');
      var content = JSON.parse(file)
      var code = content[adr];
      console.log('code: ' + code)
      if (code == undefined) {
            var NC = await getCode();
            content[adr] = NC;
            content.existingCodes.push(NC);
            fs.writeFileSync(addressDataFilePath, JSON.stringify(content,null,2),'utf8',(err)=>{
                  if(err) console.log(err)
            })
             
            return NC;
      } else {
            return code
      }
}
 
app.get('/addressofcode', (req,res)=>{
      console.log(' get address for code started')
      if (req.query.code == undefined) {
            return res.status(501).json({
                  status: 'error',
                  message: 'Code has not been detected.'
            });
      }
      if (req.query.code.length != 4) {
            return res.status(501).json({
                  status: 'error',
                  message: 'Code length is not valid.'
            });
      }

      var file =  fs.readFileSync(addressDataFilePath,'utf8')
      var content = JSON.parse(file)

    

      if (!content.existingCodes.includes(req.query.code)) {
            return res.status(501).json({
                  status: 'error',
                  message: 'Code does not exist.'
            });
      }else{
            for (key in content){
                  if (content[key] == req.query.code){
                        return res.status(200).json({
                              status: 'success',
                              code: req.query.code,
                              address: key
                        });
                  }
            }
      }
      return res.status(501).json({
            status: 'error',
            message: 'unknown error happend on server.'
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

app.get('/getAll', async function (req, res) {
 
      if (req.query.passkey == process.env.masterPassword) {
            var file = fs.readFileSync(addressDataFilePath,'utf8')
            var content = JSON.parse(file)
            delete content.existingCodes
            

            return res.status(200).json({
                  status: 'success',
                  allUsers: content//JSON.parse(fuser )
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


function getARandomChar() {
      var chars = "0123456789abcdefghkmnprstwxyz"
      return chars[Math.floor(Math.random() * 29)];
}


function generateCode(digits) {
      var t = ''
      for (let i = 0; i < digits; i++) {
            t += getARandomChar()
      }
      return t
}

async function getCode() {
      var file = fs.readFileSync(addressDataFilePath, 'utf8')
      var content = JSON.parse(file)
      var existing = content.existingCodes;
      for (let i = 0; i < 100000; i++) {
            var newCode = generateCode(codeLength);
            if (!existing.includes(newCode)) return newCode
      }
      return '000000'
}





async function getACode(length) {
      console.log('getACode started')
      //return new Promise(
      fs.readFile(addressDataFilePath, async (err, file) => {
            if (err) console.error(err)
            var content = JSON.parse(file)
            var existingCodes = content.existingCodes;
            console.log('getACode existingCodes: ')
            console.log(existingCodes)


            for (let i = 0; i < 10000; i++) {
                  var newCode = generateCode(length)
                  if (existingCodes.includes(newCode)) {
                  } else {
                        console.log('before return   newCode: ' + newCode)
                        // Promise.resolve(newCode)
                        return newCode
                  }
            }

            // var newCode = generateCode(length)
            // var check = true;
            // while (check) {
            //       if (!existingCodes.includes(newCode)) {
            //             check = false
            //             console.log('before return   newCode: ' + newCode)
            //             Promise.resolve (newCode)
            //       } else {
            //             newCode = generateCode(length)
            //       }

            // }
      })
      //)
}





//console.log(addAddressToDB('0x444cEA469D75BC034034C1464542bB5CDCeeeeee', generateCode()))

function addAddressToDB(address, code) {
      if (address.length != 42) {
            console.error('Address lenght is not 42!')
            return false
      }
      if (code.length != 6) {
            console.error('Code lenght is not 6!')
            return false
      }

      fs.readFile('./data/addressCodes.json', (err, file) => {
            if (err) { console.error(err) }
            var content = JSON.parse(file);
            content[address] = code
            fs.writeFile('./data/addressCodes.json', JSON.stringify(content, null, 2), (err) => {
                  if (err) { console.error(err) }
                  return true;
            })
      })
}
