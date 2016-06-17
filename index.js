// var parse = require('csv-parse');
// var fs = require('fs');
// var addresses = [];

// var parser = parse({delimiter: '\t'}, function(err, data){
//   for (var i = 0; i < data.length; i++) {
//       if (data[i][4] === 'CA' && ['San Jose', 'Sunnyvale', 'Mountain View', 'Los Altos', 'Redwood City', 'Santa Clara', 'Palo Alto', 'San Mateo'].indexOf(data[i][2]) !== - 1) {
//         var zipcode = data[i][1];
//         var city = data[i][2];
//         var state = data[i][4];
//         var lat = data[i][9];
//         var long = data[i][10];
//         var address = {
//             zipcode: zipcode,
//             city: city,
//             state: state,
//             lat: lat,
//             long: long
//         };
//         addresses.push(address);
//       }
//   }
//   fs.writeFile( "cities.json", JSON.stringify(addresses));
// });

// fs.createReadStream(__dirname+'/US.txt').pipe(parser);

// db.restaurants.find( { location: { $near: { $geometry: { type: 'Point', coordinates: [ -73.961704, 40.662942 ] }, $maxDistance: 100 } } } )
// db.restaurants.createIndex({ location: "2dsphere" })
// db.getCollection('users').find( { location: { $near: { $geometry: { type: 'Point', coordinates: [ -121.8908, 37.3378 ] }, $maxDistance: 3218 } } } ).count()

var bcrypt = require('bcrypt');
var async = require('async');

var users = require('./users_US_5000.json').results;
var addresses = require('./cities.json');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/pal');

var testPasswordHash = bcrypt.hashSync('password', bcrypt.genSaltSync(10));

var User = mongoose.model('User', {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    emailAddress: { type: String, required: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: true },
    verificationHash: String,
    photos: [ { large: String, medium: String, thumbnail: String } ],
    gender: { type: String, required: true },
    location: { type: { type: String, default: 'Point' }, coordinates: [Number] },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipcode: { type: String, required: true }
});

var promises = [];

for (var i = 0; i < users.length; i++) {
    var location = addresses[Math.floor(Math.random() * addresses.length)];

    var userModel = new User({
        firstName: users[i].name.first,
        lastName: users[i].name.last,
        emailAddress: users[i].email,
        password: testPasswordHash,
        verified: true,
        photos: [ { large: users[i].picture.large, medium: users[i].picture.medium, thumbnail: users[i].picture.thumbnail } ],
        location: { coordinates: [ location.long, location.lat ] },
        gender: users[i].gender,
        city: location.city,
        state: location.state,
        zipcode: location.zipcode
    });
    promises.push(userModel.save);
}

console.log(promises.length);

async.parallel(promises, function(err, results) {
    mongoose.disconnect();
    console.log('done', err);
});


// {
//   "results": [
//     {
//       "gender": male",
//       "name": {
//         "title": mr",
//         "first": samuel",
//         "last": ross"
//       },
//       "location": {
//         "street": 5592 pockrus page rd",
//         "city": santa ana",
//         "state": oregon",
//         "postcode": 69974
//       },
//       "email": samuel.ross@example.com",
//       "login": {
//         "username": silverwolf434",
//         "password": blackjac",
//         "salt": d14iEZQT",
//         "md5": 261a57061d35918f5c3ef7f90f4f2a80",
//         "sha1": c330ad8c974ab9982622d5d5506cfed4886a79ab",
//         "sha256": 8ca4a1ca48975a69bd829de61298cd6a950dede740d4c0e755d07ee4cfc06fa5"
//       },
//       "registered": 1155461743,
//       "dob": 1078494582,
//       "phone": (179)-102-8139",
//       "cell": (107)-396-0688",
//       "id": {
//         "name": SSN",
//         "value": 476-30-9095"
//       },
//       "picture": {
//         "large": https://randomuser.me/api/portraits/men/80.jpg",
//         "medium": https://randomuser.me/api/portraits/med/men/80.jpg",
//         "thumbnail": https://randomuser.me/api/portraits/thumb/men/80.jpg"
//       },
//       "nat": US"
//     }
//   ],
//   "info": {
//     "seed": 705567e86a824a27",
//     "results": 1,
//     "page": 1,
//     "version": 1.0"
//   }
// }
