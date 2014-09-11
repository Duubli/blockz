var Player = function (startX, startY, startName) {

  var x = startX,
      y = startY,
      name = startName,
      id;

  var getX = function () {
  	return x;
  };
  var getY = function () {
  	return y;
  };
  var getName = function () {
  	return name;
  }
  var setX = function (newX) {
  	x = newX;
  };
  var setY = function (newY) {
  	y = newY;
  };
  var setName = function (newName) {
  	name = newName;
  };

  return {
  	getX: getX,
  	getY: getY,
  	getName: getName,
  	setX: setX,
  	setY: setY,
  	setName: setName,
  	id: id
  }

};

exports.Player = Player;