const Photo = require("../models/Photo");
const User = require("../models/User");
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");

// INSERT PHOTO
const insertPhoto = async (req, res) => {
  try {
    const { title } = req.body;

    // Verifica se veio imagem
    if (!req.file || !req.file.path) {
      return res.status(400).json({ errors: ["Nenhuma imagem enviada."] });
    }

    const image = req.file.path;
    console.log("ARQUIVO FINAL =>", req.file)

    const reqUser = req.user;
    const user = await User.findById(reqUser._id);

    const newPhoto = await Photo.create({
      image,
      title,
      userId: user._id,
      userName: user.name,
    });

    return res.status(201).json(newPhoto);
  } catch (e) {
    console.log("Erro ao inserir foto:", e);
    return res.status(500).json({ errors: ["Erro ao inserir foto."] });
  }
};

// DELETE PHOTO
const deletePhoto = async (req, res) => {
  const { id } = req.params;
  const reqUser = req.user;

  try {
    // Correção crucial! Evita erros BSON
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ errors: ["ID inválido"] });
    }

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
    const fileName = parts[parts.length - 1]; // exemplo: foto123.jpg
    const public_id = `reactgram/photos/${fileName.split(".")[0]}`;

    // Deleta do Cloudinary
    try {
      await cloudinary.uploader.destroy(public_id);
    } catch (err) {
      console.log("Erro ao deletar do Cloudinary:", err);
    }

    // Deleta do MongoDB
    await Photo.findByIdAndDelete(photo._id);

    return res.status(200).json({ message: "Foto excluída com sucesso." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ errors: ["Erro ao excluir foto."] });
  }
};

// GET ALL PHOTOS
const getAllPhotos = async (req, res) => {
  const photos = await Photo.find({})
    .sort([["createdAt", -1]])
    .exec();

  return res.status(200).json(photos);
};

// GET USER PHOTOS
const getUserPhotos = async (req, res) => {
  const { id } = req.params;

  const photos = await Photo.find({ userId: id })
    .sort([["createdAt", -1]])
    .exec();

  return res.status(200).json(photos);
};

// GET PHOTO BY ID
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

// UPDATE PHOTO
const updatePhoto = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const reqUser = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ errors: ["ID inválido"] });
  }

  const photo = await Photo.findById(id);

  if (!photo) {
    return res.status(404).json({ errors: ["Foto não encontrada"] });
  }

  if (!photo.userId.equals(reqUser._id)) {
    return res.status(403).json({ errors: ["Acesso negado"] });
  }

  if (title) {
    photo.title = title;
  }

  await photo.save();

  res.status(200).json({ photo, message: "Foto atualizada com sucesso!" });
};

// LIKE PHOTO
const likePhoto = async (req, res) => {
  const { id } = req.params;
  const reqUser = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ errors: ["ID inválido"] });
  }

  const photo = await Photo.findById(id);

  if (!photo) {
    return res.status(404).json({ errors: ["Foto não encontrada"] });
  }

  if (photo.likes.includes(reqUser._id)) {
    return res.status(422).json({ errors: ["Você já curtiu a foto."] });
  }

  photo.likes.push(reqUser._id);
  await photo.save();

  res.status(200).json({
    photoId: id,
    userId: reqUser._id,
    message: "A foto foi curtida",
  });
};

// COMMENT PHOTO
const commentPhoto = async (req, res) => {
  const { id } = req.params;
  const reqUser = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ errors: ["ID inválido"] });
  }

  const { comment } = req.body;
  const user = await User.findById(reqUser._id);
  const photo = await Photo.findById(id);

  if (!photo) {
    return res.status(404).json({ errors: ["Foto não encontrada"] });
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

// SEARCH PHOTOS
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
