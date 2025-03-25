// Imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware para interpretar JSON
app.use(express.json());

// Importando o modelo de usuário
const User = require('./models/user');

// Rota pública
app.get('/', (req, res) => {
    res.status(200).json({ msg: "Bem-vindo à nossa API!" });
});


//Rota Privada
app.get("/user/:id", checkToken, async (req, res) => {
    
    try {
        const id = req.params.id;

        // Verifica se o usuário existe
        const user = await User.findById(id).select("-password");

        if (!user) {
            return res.status(404).json({ msg: "Usuário não encontrado" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        res.status(500).json({ msg: "Erro no servidor" });
    }
});

    function checkToken(req, res, next){

        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ msg: "Acesso negado!" });
        }

        
        try {
            const secret = process.env.SECRET;
            jwt.verify(token, secret);
            next();
        } catch (error) {
            return res.status(403).json({ msg: "Token inválido" });
        }
    }

// Rota de registro de usuário
app.post('/auth/register', async (req, res) => {
    try {
        const { name, email, password, confirmpassword } = req.body;

        // Validações
        if (!name) return res.status(422).json({ msg: 'O nome é obrigatório!' });
        if (!email) return res.status(422).json({ msg: 'O email é obrigatório!' });
        if (!password) return res.status(422).json({ msg: 'A senha é obrigatória!' });
        if (password !== confirmpassword) return res.status(422).json({ msg: 'As senhas não conferem!' });

        // Verifica se o usuário já existe
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(422).json({ msg: 'Esse email já está cadastrado!' });
        }

        // Gera o hash da senha
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        // Criando novo usuário
        const user = new User({
            name,
            email,
            password: passwordHash, // Salva a senha criptografada
        });

        await user.save();
        return res.status(201).json({ msg: 'Usuário criado com sucesso!' });

    } catch (error) {
        console.error('Erro no registro:', error);
        return res.status(500).json({ msg: 'Erro interno no servidor!' });
    }
});

app.post("/auth/login", async (req, res) => {
    const {email,password } = req.body

    //Validações
    if(!email){
        return res.status(422).json({ msg: 'O email é obrigatório!'})
    }

    if(!password){
        return res.status(422).json({msg: 'A senha é obrigatória!'})
    }

    //check se o user exists

    const user = await User.findOne({email: email})
    
    if (!user){
        return res.status(422).json({msg: 'Usuário não encontrado! '})
    }
     
    //check se a senha está certa

    const checkPassword = await bcrypt.compare(password, user.password)

    if (!checkPassword){
        return res.status(422).json({msg: 'Senha inválida'})
    }
    

    try{
        const secret = process.env.SECRET;
        const token = jwt.sign({
            id: user.id
        },
        secret,)

        res.status(200).json({msg: 'Autenticação realizada com sucesso', token})
    } catch(err){

    }
})
''
// Credenciais do banco de dados
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

// Verifica se as credenciais estão definidas
if (!dbUser || !dbPassword) {
    console.error("Erro: Variáveis de ambiente DB_USER e DB_PASS não definidas.");
    process.exit(1);
}

// Conectar ao banco de dados MongoDB
mongoose
    .connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.693x0.mongodb.net/meubanco`)
    .then(() => {
        app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
        console.log('Conectado ao banco de dados');
    })
    .catch((err) => {
        console.error('Erro ao conectar ao banco:', err);
        process.exit(1); // Encerra o processo se a conexão falhar
    });
