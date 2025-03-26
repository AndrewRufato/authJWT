# authJWT
Documentação da API de Autenticação JWT


## Introdução
Esta é uma API de autenticação desenvolvida com Node.js, Express, MongoDB Atlas e JWT (JSON Web Token). A API permite o registro, login e acesso a rotas protegidas.

## Tecnologias Utilizadas

- **Node.js** - Ambiente de execução JavaScript
- **Express.js** - Framework web para Node.js
- **MongoDB Atlas** - Banco de dados NoSQL na nuvem
- **Mongoose** - ODM para interagir com MongoDB
- **bcrypt** - Biblioteca para hash de senhas
- **jsonwebtoken** - Biblioteca para geração e verificação de tokens JWT
- **dotenv** - Para gerenciar variáveis de ambiente
- **Postman** - Ferramenta para testar e validar a API

## Configuração do Projeto

### 1. Instalação do Node.js e Criação do Projeto

Instale o Node.js e, em seguida, crie uma pasta para o projeto e inicialize um repositório Node.js:

```sh
mkdir authJWT-api
cd authJWT-api
npm init -y
```

### 2. Instalação das Dependências

```sh
npm install express mongoose bcrypt jsonwebtoken dotenv
```

### 3. Configuração do Banco de Dados (MongoDB Atlas)

1. Acesse o [MongoDB Atlas](https://www.mongodb.com/atlas) e crie uma conta.
2. Crie um novo cluster e um banco de dados.
3. Copie a string de conexão do MongoDB e substitua `<DB_USER>` e `<DB_PASS>` por suas credenciais.
4. Crie um arquivo `.env` no projeto:

```
DB_USER=seu_usuario
DB_PASS=sua_senha
SECRET=seu_token_secreto
```

### 4. Estrutura do Projeto

```
/authJWT-api
│── models
│   └── user.js
│── routes
│   └── auth.js
│── server.js
│── .env
│── package.json
```

### 5. Criação do Modelo de Usuário (Mongoose)

Crie `models/user.js`:

```js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

module.exports = mongoose.model('User', UserSchema);
```

### 6. Configuração do Servidor Express

Crie `server.js`:

```js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster.mongodb.net/?retryWrites=true&w=majority`)
    .then(() => {
        app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
        console.log('Conectado ao banco de dados');
    })
    .catch(err => console.error('Erro ao conectar ao banco:', err));
```

### 7. Implementação das Rotas de Autenticação

Crie `routes/auth.js`:

```js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, email, password, confirmpassword } = req.body;
    if (!name || !email || !password || password !== confirmpassword) {
        return res.status(422).json({ msg: 'Dados inválidos' });
    }
    
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(422).json({ msg: 'Email já cadastrado' });
    
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const user = new User({ name, email, password: passwordHash });
    await user.save();
    res.status(201).json({ msg: 'Usuário criado com sucesso!' });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'Usuário não encontrado' });
    
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) return res.status(401).json({ msg: 'Senha inválida' });
    
    const token = jwt.sign({ id: user.id }, process.env.SECRET, { expiresIn: '1h' });
    res.status(200).json({ msg: 'Autenticado com sucesso', token });
});

module.exports = router;
```

### 8. Testando com Postman

1. **Registro de Usuário**
   - Método: `POST`
   - URL: `http://localhost:3000/auth/register`
   - Body (JSON):
   ```json
   {
       "name": "Usuário Teste",
       "email": "teste@email.com",
       "password": "123456",
       "confirmpassword": "123456"
   }
   ```

2. **Login**
   - Método: `POST`
   - URL: `http://localhost:3000/auth/login`
   - Body (JSON):
   ```json
   {
       "email": "teste@email.com",
       "password": "123456"
   }
   ```
   - Retorno esperado:
   ```json
   {
       "msg": "Autenticado com sucesso",
       "token": "seu_token_jwt"
   }
   ```

### 9. Conclusão

Esta API implementa um sistema de autenticação JWT seguro e funcional, utilizando MongoDB Atlas como banco de dados. Com o Postman, podemos testar e validar as funcionalidades implementadas.


