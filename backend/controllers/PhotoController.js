const Photo = require("../models/Photo");
const User = require("../models/User");

const mongoose = require("mongoose");

// Insert a photo, with an user related to it
const insertPhoto = async (req, res) => {
    const { title } = req.body;

    // Cloudinary devolve a URL final em req.file.path
    const image = req.file?.path;

    if (!image) {
        return res.status(400).json({ errors: ["Nenhuma imagem enviada."] });
    }

    const reqUser = req.user;
    const user = await User.findById(reqUser._id);

    const newPhoto = await Photo.create({
        image,            // agora é a URL do Cloudinary
        title,
        userId: user._id,
        userName: user.name
    });

    if (!newPhoto) {
        res.status(422).json({
            errors: ["Houve um problema, tente novamente mais tarde."],
        });
        return;
    }

    res.status(201).json(newPhoto);
};

// Remove a photo
const cloudinary = require("../config/cloudinary");

const deletePhoto = async (req, res) => {
  const { id } = req.params;
  const reqUser = req.user;

  try {
    const photo = await Photo.findById(id);

    if (!photo) {
      return res.status(404).json({ errors: ["Foto não encontrada!"] });
    }

    if (!photo.userId.equals(reqUser._id)) {
      return res.status(403).json({ errors: ["Acesso negado."] });
    }

    // Extrai o public_id do Cloudinary
    const url = photo.image;
    const parts = url.split("/");
    const file = parts[parts.length - 1];
    const public_id = `reactgram/photos/${file.split(".")[0]}`;

    // Deleta do Cloudinary
    await cloudinary.uploader.destroy(public_id);

    // Deleta do MongoDB
    await Photo.findByIdAndDelete(photo._id);

    return res.status(200).json({ message: "Foto excluída com sucesso." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errors: ["Erro ao excluir foto."] });
  }
};

// Get all photos
const getAllPhotos = async (req, res) => {
    const photos = await Photo.find({}).sort([["createdAt", -1]]).exec();
    return res.status(200).json(photos);
};

// Get user photos
const getUserPhotos = async (req, res) => {
    const { id } = req.params;
    const photos = await Photo.find({ userId: id }).sort([["createdAt", -1]]).exec();

    return res.status(200).json(photos);
};

// Get photo by id
const getPhotoById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ errors: ["Foto não encontrada"] });
    }

    const photo = await Photo.findById(id);

    if (!photo) {
        return res.status(404).json({ errors: ["Foto não encontrada"] });
    }

    return res.status(200).json(photo);
};

// Update a photo
const updatePhoto = async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    const reqUser = req.user;

    const photo = await Photo.findById(id);

    if (!photo) {
        res.status(404).json({
            errors: ["Foto não encontrada"],
        });
        return;
    }

    if (!photo.userId.equals(reqUser._id)) {
        res.status(422).json({
            errors: ["Ocorreu um erro, por favor tente novamente mais tarde"],
        });
        return;
    }

    if (title) {
        photo.title = title;
    }

    await photo.save();

    res.status(200).json({ photo, message: "Foto atualizada com sucesso!" });
};

// Like
const likePhoto = async (req, res) => {
    const { id } = req.params;
    const reqUser = req.user;

    const photo = await Photo.findById(id);

    if (!photo) {
        res.status(404).json({
            errors: ["Foto não encontrada"],
        });
        return;
    }

    if (photo.likes.includes(reqUser._id)) {
        res.status(422).json({
            errors: ["Você já curtiu a foto."],
        });
        return;
    }

    photo.likes.push(reqUser._id);
    await photo.save();

    res.status(200).json({
        photoId: id,
        userId: reqUser._id,
        message: "A foto foi curtida",
    });
};

// Comment
const commentPhoto = async (req, res) => {
    const { id } = req.params;
    const reqUser = req.user;

    const { comment } = req.body;
    const user = await User.findById(reqUser._id);
    const photo = await Photo.findById(id);

    if (!photo) {
        res.status(404).json({
            errors: ["Foto não encontrada"],
        });
        return;
    }

    const userComment = {
        comment,
        userName: user.name,
        userImage: user.profileImage,
        userId: user._id,
    };

    photo.comments.push(userComment);

    await photo.save();

    res.status(200).json({
        comment: userComment,
        message: "O comentário foi adicionado com sucesso!",
    });
};

// Search
const searchPhotos = async (req, res) => {
    const { q } = req.query;

    const photos = await Photo.find({
        title: new RegExp(q, "i"),
    }).exec();

    res.status(200).json(photos);
};

module.exports = {
    insertPhoto,
    deletePhoto,
    getAllPhotos,
    getUserPhotos,
    getPhotoById,
    updatePhoto,
    likePhoto,
    commentPhoto,
    searchPhotos,
};
