// bcrypt.js
const bcrypt = require('bcryptjs');

const password = 'Admin1234'; // 

// hash
bcrypt.hash(password, 10, (err, hashedPassword) => {
  if (err) {
    console.log('Error hashing password:', err);
  } else {
    console.log('Hashed Password:', hashedPassword); // 
  }
});
