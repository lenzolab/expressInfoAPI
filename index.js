console.log('Hello World')
var express = require('express');
var app = express();
var eenv = require('dotenv').config()
const port = process.env.PORT || 3000;
var dburi = process.env.dburi
const cors = require('cors');
var fs = require('fs');
const { emit } = require('process');
// const { setFlagsFromString } = require('v8');
// const { Promise } = require('mongoose');
// const { setTimeout } = require('timers/promises');

//#region Settings

const codeLength = 4;
const addressDataFilePath = './data/addressCodes.json'
const emailDataFilePath = './data/email.json'

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
            console.log('Origin Error. check if this origin is accepted on env:')
            console.log(origin)
      }

});
//#endregion



//#region ========>>>   Referral codes   <<<========

// Public end point ##
// Input: Address
// returns the assigned code for the address.
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



// Public end point ##
// Input: code
// returns the address for the given code.
app.get('/addressofcode', (req, res) => {
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

      var file = fs.readFileSync(addressDataFilePath, 'utf8')
      var content = JSON.parse(file)



      if (!content.existingCodes.includes(req.query.code)) {
            return res.status(501).json({
                  status: 'error',
                  message: 'Code does not exist.'
            });
      } else {
            for (key in content) {
                  if (content[key] == req.query.code) {
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


// Public end point ## Access ristricted to pass key for admin.
// returns all registered addresses and their code.
app.get('/getAllAddress', async function (req, res) {

      if (req.query.passkey == process.env.masterPassword) {
            var file = fs.readFileSync(addressDataFilePath, 'utf8')
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



//#region generation of referral code

// returns a random char from the specified char set.
function getARandomChar() {
      var chars = "0123456789abcdefghkmnprstwxyz"
      return chars[Math.floor(Math.random() * 29)];
}

// generate a code with a specific length
function generateCode(digits) {
      var t = ''
      for (let i = 0; i < digits; i++) {
            t += getARandomChar()
      }
      return t
}


// generates a new unique code
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

// assigns a code to an address
async function getCodeForAddress(adr) {
      var file = fs.readFileSync(addressDataFilePath, 'utf8');
      var content = JSON.parse(file)
      var code = content[adr];
      console.log('code: ' + code)
      if (code == undefined) {
            var NC = await getCode();
            content[adr] = NC;
            content.existingCodes.push(NC);
            fs.writeFileSync(addressDataFilePath, JSON.stringify(content, null, 2), 'utf8', (err) => {
                  if (err) console.log(err)
            })

            return NC;
      } else {
            return code
      }
}

//#endregion

//#endregion





//#region ========>>>   Email   <<<========

// Public endpoint
// Input: Email address
// Adds the email address to the email list
app.get('/addEmail', async function (req, res) {
      if (req.query.email == undefined) {
            return res.status(501).json({
                  status: 'error',
                  message: 'email not detected on the query params.'
            });
      }

      try {

            var newEmail = req.query.email;
            if (!validateEmail(newEmail)) {
                  return res.status(501).json({
                        status: 'error',
                        message: 'email format is not valid.'
                  });
            }

            var file = fs.readFileSync(emailDataFilePath, 'utf8');
            var content = JSON.parse(file)
            if (!content.emails.includes(newEmail)) {
                  content.emails.push(newEmail);
                  fs.writeFileSync(emailDataFilePath, JSON.stringify(content, null, 2), 'utf8', (err) => {
                        if (err) console.log(err)
                  })
                  console.log('email added: ' + newEmail)
            }




            return res.status(200).json({
                  status: 'success',
                  message: 'email has been added to the list.'
            });

      } catch (error) {
            return res.status(501).json({
                  status: 'error',
                  message: 'Could not add the email to the list.'
            });
      }
});

//Validates the input email format
const validateEmail = (email) => {
      return email.match(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
};

// Public endpoint ## Access ristricted to pass key for admin.
// Returns the email list
app.get('/getEmails', async function (req, res) {
      console.log(req.query.passkey)
      console.log(process.env.masterPassword)
      if (req.query.passkey == process.env.masterPassword) {
            var file = fs.readFileSync(emailDataFilePath, 'utf8');
            var content = JSON.parse(file)
            return res.status(200).json({
                  status: 'success',
                  content: content
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

//#endregion






//#region ========>>>   Application Listen   <<<========


// returns "Hello World"
app.get('/', function (req, res) {
      res.send('Hello World!');
});


// Retruns an object for test. Example:
/*
{
"status": "success",
"time": "Sun Mar 10 2024 12:40:52 GMT+0000 (Coordinated Universal Time)"
}
*/
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

// Runs the app on the Port
app.listen(port, async () => {
      console.log(`Example app listening on port ${port}!`);
});
//#endregion
