const mongoose = require('mongoose')
const db = require('../db')
const User = require('../models/User')

db.connect(mongoose, function() {
  User.find()
    .then(users => {
      const userUpdates = users.map(user => {
        user.certifications.prealgebra.passed =
          user.certifications.algebra.passed
        return user.save()
      })
      return Promise.all(userUpdates)
    })
    .catch(err => {
      if (err) {
        console.log(err)
      }
    })
    .finally(() => {
      console.log('disconnecting')
      mongoose.disconnect()
    })
})
