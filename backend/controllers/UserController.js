const User = require('../models/User')

const mongoose = require('mongoose')

const bcrypty = require("bcryptjs")
const jwt = require("jsonwebtoken");
const { unsubscribe } = require('../routes/Router');

const jwtSecret = process.env.JWT_SECRET;

// Generate user token

const generateToken = (id) => {
    return jwt.sign({ id }, jwtSecret, {
        expiresIn: "7d",
    })
}

// register user and sign in

const register = async (req, res) => {

    const { name, email, password } = req.body;

    // check if user exists
    const user = await User.findOne({ email })

    if (user) {
        res.status(422).json({ errors: ["E-mail já cadastrado"] })
        return
    }

    // Generate password hash
    const salt = await bcrypty.genSalt()
    const passwordHash = await bcrypty.hash(password, salt);

    // create user

    const newUser = await User.create({
        name,
        email,
        password: passwordHash
    })

    // if user was created successfully, return the token

    if (!newUser) {
        res.status(422).json({ errors: ["Houve um erro, por favor tente novamente."] })
        return
    }

    res.status(201).json({
        _id: newUser._id,
        token: generateToken(newUser._id),
    })
}

// sign user in
const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email })

    // check if user exists
    if (!user) {
        res.status(404).json({ errors: ["Usuário não encontrado."] })
        return
    }

    // check if password matches
    if (!(await bcrypty.compare(password, user.password))) {
        res.status(422).json({ errors: ["Senha Inválida."] })
        return
    }

    // return user with token

    res.status(201).json({
        _id: user._id,
        profileImage: user.profileImage,
        token: generateToken(user._id)
    })
}

// get current logged in user
const getCurrentUser = async (req, res) => {
    const user = req.user;

    res.status(200).json(user);
}

// update an user

// update an user
const update = async (req, res) => {
    const { name, password, bio } = req.body;

    let profileImage = null;
    if (req.file) {
        profileImage = req.file.path;
    }

    const reqUser = req.user;

    const user = await User.findById(reqUser._id).select("-password");

    if (!user) {
        return res.status(404).json({ errors: ["Usuário não encontrado."] });
    }

    if (name) user.name = name;

    if (password) {
        const salt = await bcrypty.genSalt();
        const passwordHash = await bcrypty.hash(password, salt);
        user.password = passwordHash;
    }

    if (profileImage) user.profileImage = profileImage;
    if (bio) user.bio = bio;

    await user.save();

    res.status(200).json(user);
};


// get user by id

const getUserById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ errors: ["ID inválido."] });
  }

  try {
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ errors: ["Usuário não encontrado."] });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ errors: ["Erro ao buscar usuário."] });
  }
};


module.exports = {
    register,
    login,
    getCurrentUser,
    update,
    getUserById
}