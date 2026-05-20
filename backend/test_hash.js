const bcrypt = require("bcryptjs");

const plainPassword = "admin123";

const hash =
"$2b$10$N/CmHMwsPFBJMJT2J6jve.fBemRhOx3IN7DkijSIrYMut0ETA2WyG";

bcrypt.compare(plainPassword, hash)
.then(result => {
    console.log(result);
});
