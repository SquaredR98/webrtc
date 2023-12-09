const { error } = require('console');
const { app } = require('./server');
const jwt = require('jsonwebtoken');
const { users } = require('./data');


const authenticate = (req, res, next) => {
  const token = req['headers']?.authorization?.split(" ")[1];
  if(!token) {
    throw new Error('Unauthorized');
  }
  const currentUser = jwt.verify(token, "forbiddenKeyDoNotShare");
  req.currentUser = currentUser;
  next();
}

app.get('/test', (req, res) => {
  res.send({ success: true, message: 'Test endpoint successful' })
})

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if(!username) throw new Error('Username is required');
  if(!password) throw new Error('Password is required');

  let userExists = users.find(user => user.username === username);
  if(!userExists) {
    throw new Error('No Such Users')
  }
  
  const passwordMatch = userExists.password === password;
  if(!passwordMatch) {
    throw new Error('Invalid Credentials')
  }
  
  userExists.online = true;
  const sendUserData = {
    username: userExists.username,
    name: userExists.name
  }

  const token = jwt.sign({...sendUserData}, "forbiddenKeyDoNotShare")
  res.send({ success: true, data: { ...userExists, token } })
})

app.get('/users', authenticate, (req, res) => {
  const currentUser = req.currentUser;
  let availableUsers = users.filter(user => user.username !== currentUser.username);
  availableUsers = availableUsers.map(e => ({ username: e.username, name: e.name, online: e.online }));

  res.json({success: true, availableUsers});
})

app.get('/me', authenticate, (req, res) => {
  const currentUser = req.currentUser;
  res.json({success: true, currentUser});
})


app.use((err, req, res, next) => {
  if(!err) {
    return next();
  }
  error(`[${new Date().toUTCString()}]: ${err.message}`)
  error(err);
  res.status(500).json({ error: err.message});
})