import { api, requestConfig } from "../utils/config";

async function safeFetch(url, config) {
  const response = await fetch(url, config);
  let data;

  try {
    data = await response.json();
  } catch {
    data = { error: "Invalid JSON response" };
  }

  return data;
}

// Publish an user photo
const publishPhoto = async (data, token) => {
  const config = requestConfig("POST", data, token, true);
  return await safeFetch(api + "photos", config);
};

// Get user photos
const getUserPhotos = async (id, token) => {
  const config = requestConfig("GET", null, token);
  return await safeFetch(api + "photos/user/" + id, config);
};

// Delete a photo
const deletePhoto = async (id, token) => {
  const config = requestConfig("DELETE", null, token);
  return await safeFetch(api + "photos/" + id, config);
};

// Update a photo
const updatePhoto = async (data, id, token) => {
  const config = requestConfig("PUT", data, token);
  return await safeFetch(api + "photos/" + id, config);
};

// Get photo by ID
const getPhoto = async (id, token) => {
  const config = requestConfig("GET", null, token);
  return await safeFetch(api + "photos/" + id, config);
};

// Like
const like = async (id, token) => {
  const config = requestConfig("PUT", {}, token);
  return await safeFetch(api + "photos/like/" + id, config);
};

// Comment
const comment = async (data, id, token) => {
  const config = requestConfig("PUT", data, token);
  return await safeFetch(api + "photos/comment/" + id, config);
};

// Get all photos
const getPhotos = async (token) => {
  const config = requestConfig("GET", null, token);
  return await safeFetch(api + "photos/", config);
};

// Search photos
const searchPhotos = async (query, token) => {
  const config = requestConfig("GET", null, token);
  return await safeFetch(api + "photos/search?q=" + query, config);
};

const photoService = {
  publishPhoto,
  getUserPhotos,
  deletePhoto,
  updatePhoto,
  getPhoto,
  like,
  comment,
  getPhotos,
  searchPhotos,
};

export default photoService;
