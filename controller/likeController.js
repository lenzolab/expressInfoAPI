console.log('Hello Like Controller')
fs = require('fs')
const NFTlikesDataFilePath = './data/NFTlikes.json'
var likesOfAddress = async function (address) {
      if (address.length != 42) {
            return ({ status: 'error', message: 'Addres length is not correct.' })
      }
      let allLikes = await getAllDB();
      let keys = Object.keys(allLikes);
      let counts = new Array()
      for (let i = 0; i < keys.length; i++) {
            const element = keys[i];
            console.log(element)
            if (keys[i] != 'Dataset') {
                  if (allLikes[keys[i]].includes(address)) {
                        counts.push(Number(keys[i]))
                  }
            }
      }
      return counts;
}
var getAllLikeCounts = async function () {
      let allLikes = await getAllDB();
      let keys = Object.keys(allLikes);
      let counts = new Array()
      for (let i = 0; i < keys.length; i++) {
            const element = keys[i];
            console.log(element)
            if (keys[i] != 'Dataset') {
                  counts[i] = { "NFTid": Number(keys[i]), "likesCount": allLikes[keys[i]].length }
            } 
      }
      return counts;
};

var unlike = async function (id, address) {
      if (address.length != 42) {
            return ({ status: 'error', message: 'Addres length is not correct.' })
      }
      if (id > 50000) {
            return ({ status: 'error', message: 'Id is out of range.' })
      }

      let allLikes = await getAllDB();

      if (allLikes[id] != undefined) {
            if (!allLikes[id].includes(address)) {
                  return true
            } else {
                  let array = allLikes[id]
                  for (var i in array) {
                        if (array[i] == address) {
                              array.splice(i, 1);
                              //break;
                        }
                  }
                  allLikes[id] = array;
                  return await writeAllDB(allLikes)
            }
      }
      else {
            return ({ status: 'error', message: 'Id is not correct.' })

      }

};

var like = async function (id, address) {
      if (address.length != 42) {
            return ({ status: 'error', message: 'Addres length is not correct.' })
      }
      if (id > 50000) {
            return ({ status: 'error', message: 'Id is out of range.' })
      }
      let allLikes = await getAllDB();
      if (allLikes[id] != undefined) {
            if (allLikes[id].includes(address)) {
                  return true
            } else {
                  allLikes[id].push(address)
                  return await writeAllDB(allLikes)
            }
      }
      else {
            allLikes[id] = [address]
            return await writeAllDB(allLikes)
      }

};







async function getAllDB() {
      var file = await fs.readFileSync(NFTlikesDataFilePath, 'utf8');
      var content = JSON.parse(file);
      return content;
}

async function writeAllDB(content) {
      try {
            await fs.writeFileSync(NFTlikesDataFilePath, JSON.stringify(content, null, 2), 'utf8')
            return true
      } catch (error) {
            console.log(error)
            return ({ status: 'error', 'message': error })
      }
}

module.exports = {
      getAllLikeCounts: getAllLikeCounts,
      likeN: like,
      unlikeN: unlike,
      likesOfAddressN: likesOfAddress
}