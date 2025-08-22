const path = require("path");
const fs = require("fs");
const { deleteFile } = require("../utils");
const { default: axios } = require("axios");
const qs = require("qs");
const { Game, SubCategory } = require("../models/Game");

//// -------------------------post-data--------------------------
const getGamePLAY_URL = async (req, res) => {
  try {
   // const { username, bet_amount, win_amount, sports_id, currency, balance } = req.body;

   

      const postData = {
     // slug: "slug",
      username: "oraGame",
      money: 100,
      home_url: "https://g.oracleapi.co.uk",
      token: "4895677890656568745",
     // userid: matcheduser._id,
      gameid: req.body.gameID
    };

    console.log(postData);

    // POST request
    const response = await axios.post('https://dstplay.net/getgameurl', qs.stringify(postData), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log('Response from joyhobe.com:', response.data, 'Status:', response.status);

  

    res.status(200).json({
      success: true,
      message: 'POST request successful 23',
      data: {
       // gameRecordId: updatedUser.gameHistory[updatedUser.gameHistory.length - 1]._id // Return the ID of the new record
      },
      joyhobeResponse: response.data
    });
  } catch (error) {
    console.error('Error in POST /api/test/game:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to forward POST request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// Create game
const creategame = async (req, res) => {
  try {
    const {
      name,
      gamelink,
      gameapikey,
      maxwin,
      volatility,
      paylines,
      publishtimes,
      specialfeatures,
      supportedlanguage,
      gameID,
      description,
      imageUrl,
      subCategory,
      category,
      keycode,
      mobileImages,
      gameTrailerLink,
      desktopImages
    } = req.body;

    if (!name || !gameID || !subCategory || !category) {
      return res.status(400).send({ success: false, message: "Required fields are missing!" });
    }

    const api_key = process.env.API_CODE;
    if (keycode != api_key) {
      return res.status(401).send({ success: false, message: "Invalid Api Key!" });
    }

    const existGame = await Game.findOne({ $or: [{ name }, { gameID }] });
    if (existGame) {
      return res.status(409).send({ success: false, message: "Game name or ID already exists!" });
    }

    // Find subCategory ID by title
    const subCategoryDoc = await SubCategory.findOne({ title: subCategory });
    if (!subCategoryDoc) {
      return res.status(404).send({ success: false, message: "Sub-category not found!" });
    }

    const featuresArray = typeof specialfeatures === 'string' ?
      specialfeatures.split(',').map(item => item.trim()) :
      specialfeatures || [];

    const languagesArray = typeof supportedlanguage === 'string' ?
      supportedlanguage.split(',').map(item => item.trim()) :
      supportedlanguage || [];

    const newGame = new Game({
      name,
      gamelink: gamelink || "",
      gameapikey: gameapikey || "",
      maxwin: maxwin || 0,
      volatility: volatility || "",
      paylines: paylines || "",
      publishtimes: publishtimes ? new Date(publishtimes) : null,
      specialfeatures: featuresArray,
      supportedlanguage: languagesArray,
      gameID,
      desktopImages,
      mobileImages,
      description: description || "",
      imageUrl: imageUrl || "",
      subCategory: subCategoryDoc._id,
      category,
      gameTrailerLink
    });

    await newGame.save();
    res.status(200).send({ success: true, message: "Game created successfully!", game: newGame });

  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
};

// Update game
const updateGame = async (req, res) => {
  try {
    const {
      name,
      gamelink,
      gameapikey,
      maxwin,
      volatility,
      paylines,
      publishtimes,
      specialfeatures,
      supportedlanguage,
      gameID,
      description,
      imageUrl,
      subCategory,
      category,
      keycode,
      mobileImages,
      desktopImages,
      gameTrailerLink
    } = req.body;

    // Validate API key
    const api_key = process.env.API_CODE;
    if (keycode !== api_key) {
      return res.status(401).send({ success: false, message: "Invalid API Key!" });
    }

    // Find game by gameID
    const game = await Game.findOne({ gameID });
    if (!game) {
      return res.status(404).send({ success: false, message: "Game not found!" });
    }

    // Check if new name is already taken by another game
    if (name && name !== game.name) {
      const existGame = await Game.findOne({ name, gameID: { $ne: gameID } });
      if (existGame) {
        return res.status(409).send({ success: false, message: "Game name already exists!" });
      }
    }

    // Find subCategory ID by title
    let subCategoryId = game.subCategory;
    if (subCategory) {
      const subCategoryDoc = await SubCategory.findOne({ title: subCategory });
      if (!subCategoryDoc) {
        return res.status(404).send({ success: false, message: "Sub-category not found!" });
      }
      subCategoryId = subCategoryDoc._id;
    }

    // Parse special features and supported languages
    const featuresArray = specialfeatures
      ? typeof specialfeatures === 'string'
        ? specialfeatures.split(',').map(item => item.trim())
        : Array.isArray(specialfeatures) ? specialfeatures : []
      : game.specialfeatures;

    const languagesArray = supportedlanguage
      ? typeof supportedlanguage === 'string'
        ? supportedlanguage.split(',').map(item => item.trim())
        : Array.isArray(supportedlanguage) ? supportedlanguage : []
      : game.supportedlanguage;

    // Update game fields
    const updatedFields = {
      name: name || game.name,
      gamelink: gamelink !== undefined ? gamelink : game.gamelink,
      gameapikey: gameapikey !== undefined ? gameapikey : game.gameapikey,
      maxwin: maxwin !== undefined ? maxwin : game.maxwin,
      volatility: volatility !== undefined ? volatility : game.volatility,
      paylines: paylines !== undefined ? paylines : game.paylines,
      publishtimes: publishtimes ? new Date(publishtimes) : game.publishtimes,
      specialfeatures: featuresArray,
      supportedlanguage: languagesArray,
      description: description !== undefined ? description : game.description,
      imageUrl: imageUrl !== undefined ? imageUrl : game.imageUrl,
      subCategory: subCategoryId,
      category: category || game.category,
      mobileImages: mobileImages !== undefined ? mobileImages : game.mobileImages,
      desktopImages: desktopImages !== undefined ? desktopImages : game.desktopImages,
      gameTrailerLink
    };

    // Update game in database
    const updatedGame = await Game.findOneAndUpdate(
      { gameID },
      { $set: updatedFields },
      { new: true, runValidators: true }
    );

    res.status(200).send({
      success: true,
      message: "Game updated successfully!",
      game: updatedGame
    });

  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
};

// Delete game
const deletegame = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify JWT token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).send({ success: false, message: "No token provided" });
    }

    // Find the game
    const game = await Game.findById(id);
    if (!game) {
      return res.status(404).send({ success: false, message: "Game not found" });
    }

    // Delete associated images
    if (game.imageUrl) {
      await deleteFile(game.imageUrl);
    }
    if (game.desktopImages && game.desktopImages.length > 0) {
      await Promise.all(game.desktopImages.map((img) => deleteFile(img)));
    }
    if (game.mobileImages && game.mobileImages.length > 0) {
      await Promise.all(game.mobileImages.map((img) => deleteFile(img)));
    }

    // Delete the game from the database
    await Game.findByIdAndDelete(id);

    res.send({ success: true, message: "Game deleted successfully" });
  } catch (error) {
    console.error("Delete Game Error:", error);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
};

// Get all games
const getAllGames = async (req, res) => {
  try {
    const games = await Game.find().populate('subCategory', 'title');
    res.send({
      success: true,
      games: games,
      count: games.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
};

// Get single game
const getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id).populate('subCategory', 'title');
    if (!game) {
      return res.status(404).send({ success: false, message: "Game not found!" });
    }

    res.send({ success: true, game: game });

  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
};

// Get slot games
const slotgames = async (req, res) => {
  try {
    const keycode = req.headers['x-api-key'];
    const api_key = process.env.API_CODE;
    if (keycode != api_key) {
      return res.status(401).send({ success: false, message: "Invalid Api Key!" });
    }

    const slotgames = await Game.find({ category: "slot" }).populate('subCategory', 'title');
    res.send({
      success: true,
      games: slotgames,
      count: slotgames.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
};

// Get casino games
const casinogames = async (req, res) => {
  try {
    const keycode = req.headers['x-api-key'];
    const api_key = process.env.API_CODE;
    if (keycode != api_key) {
      return res.status(401).send({ success: false, message: "Invalid Api Key!" });
    }

    const casinogames = await Game.find({ category: "casino" }).populate('subCategory', 'title');
    res.send({
      success: true,
      games: casinogames,
      count: casinogames.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
};

// Get sports games
const sportsgame = async (req, res) => {
  try {
    const keycode = req.headers['x-api-key'];
    const api_key = process.env.API_CODE;
    if (keycode != api_key) {
      return res.status(401).send({ success: false, message: "Invalid Api Key!" });
    }

    const sportsgames = await Game.find({ category: "sports" }).populate('subCategory', 'title');
    res.send({
      success: true,
      games: sportsgames,
      count: sportsgames.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  creategame,
  slotgames,
  casinogames,
  sportsgame,
  deletegame,
  getAllGames,
  getGameById,
  updateGame,
  getGamePLAY_URL
};