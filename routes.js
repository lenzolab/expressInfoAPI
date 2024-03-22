var likeController = require('./controller/likeController');
 

var allLikes = async function (req, res) {
      res.send(await likeController.getAllLikeCounts());
};

var likesOfAddress = async function (req, res) {
      let address = req.query.address
      res.send(await likeController.likesOfAddressN(address));
};

var like = async function (req, res) {
      let id = req.query.id
      let address =  req.query.address
      res.send(await likeController.likeN(id,address));
};
 
var unlike = async function (req, res) {
      let id = req.query.id
      let address = req.query.address
      res.send(await likeController.unlikeN(id, address));
};



module.exports = {
      all: allLikes, like:like, unlike:unlike,
      likesOfAddress: likesOfAddress
}