
var mongoose = require('mongoose')
var config = require('../config.js')
var User = require('../models/User')
var twilio = require('twilio')
const client = twilio(config.accountSid,config.authToken)

//todo
//limit instead of stopping at the index of 3
//move code to separate functions
//foreach
//limit data response from server
//lodash
//ensureindex
//logging

function getAvailability(){

		var date = new Date()
		var day = date.getDay();
		var hour = date.getHours();
		var min = date.getMinutes()/60


		if(min >= .5){
			hour++;
		}
		if(hour > 12){
			hour = `${hour - 12}p`
		}
		else {
			hour = `${hour}a`
		}

		var days = ['Sunday', 'Monday', 'Tuesday','Wednesday','Thursday','Friday','Saturday']
		var time = `${hour-12}-${hour -11}`;
		return `availability.${days[day]}.${hour}`;

}

var getAvailableVolunteersFromDb = function(subtopic){

		var availability = getAvailability();
		console.log(availability);

		var certificationPassed = subtopic + ".passed";

		var userQuery = {
			[certificationPassed]: true,
			[availability]: true,
			registrationCode: "COACH18"
		};

		var query = User.find(userQuery).select({phone: 1, firstname: 1}).limit(5);

		return query;
		
	
}

function send(phoneNumber, name, subtopic){
	var phoneNumber = '+1' + phoneNumber
	client.messages.create({
			to: phoneNumber,
			from: config.sendingNumber,
			body: `Hi ${name}, A student is waiting for help in ${subtopic} at app.upchieve.org`,
		})
		.then(message => console.log(`Message sent to ${phoneNumber} with message id \n` + message.sid));  		
}


module.exports = {

	notify: function(type, subtopic){

	

		getAvailableVolunteersFromDb(subtopic).exec(function (err, persons) {

				persons.forEach(function(person){

					send(person.phone, person.firstname, subtopic);

				})

		})


	}
}
