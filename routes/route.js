const express = require("express");
const {Game , SubCategory} = require("../models/Game");
const router = express.Router();
const multer = require("multer");
const { 
    creategame, 
    slotgames, 
    casinogames, 
    sportsgame, 
    deletegame,
    getAllGames,
    getGameById,
    updateGame, 
    getGamePLAY_URL
} = require("../controllers/Gamecontroller");
const { createSubCategory, getAllSub, getAllSubCategory, updateSubCategoryById, deleteSubCategoryById } = require("../controllers/SubMenuController");

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./public/uploads")
    },
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`)
    }
});
const upload = multer({ storage: storage });



// get the game play url 

router.post("/get-the-play-game",getGamePLAY_URL)

// Create game
router.post("/create-game", creategame);



// Update game
router.put("/update-game/:id",  updateGame);

// Delete game
router.delete("/delete-game/:id", deletegame);

// Get all games
router.get("/games", getAllGames);

// Get single game
router.get("/games/:id", getGameById);

// Category specific routes
router.get("/slot-game", slotgames);
router.get("/casino-game", casinogames);
router.get("/sports-game", sportsgame);


// ? sub category section 
router.get('/subcategories' , getAllSubCategory);


// ? create sub category 
router.post('/submenu' , createSubCategory);

// ? update sub category by id 
router.put('/subcategories/:id' , updateSubCategoryById);


// ? delete sub category by id 
router.delete('/subcategories/:id', deleteSubCategoryById)



// ! Add sub-categories based on game providers
router.post("/add-subcategories-from-providers", async (req, res) => {
  try {
    const games = await Game.find();

    if (!games || games.length === 0) {
      return res.status(404).send({ error: "No games found." });
    }

    const providers = [...new Set(games.map(game => game.provider))];

    const existingSubCategories = await SubCategory.find({ title: { $in: providers } });
    const existingSubCategoryTitles = existingSubCategories.map(sc => sc.title);

    const newSubCategories = providers.filter(provider => !existingSubCategoryTitles.includes(provider));

    const subCategoryDocs = newSubCategories.map(provider => ({
      title: provider,
      img: "",
      parentMenu: games.find(game => game.provider === provider)?.category || "",
    }));

    let insertedCount = 0;
    if (subCategoryDocs.length > 0) {
      const inserted = await SubCategory.insertMany(subCategoryDocs);
      insertedCount = inserted.length;

      const updatePromises = games.map(async (game) => {
        const subCategory = await SubCategory.findOne({ title: game.provider });
        if (subCategory) {
          await Game.updateOne(
            { _id: game._id },
            { $set: { subCategory: subCategory._id } }
          );
        }
      });

      await Promise.all(updatePromises);
    }

    res.send({
      message: "Sub-categories added and games updated successfully.",
      addedSubCategories: insertedCount,
      updatedGames: games.length,
    });
  } catch (error) {
    console.error("Error adding sub-categories:", error);
    res.status(500).send({ error: "Failed to add sub-categories and update games." });
  }
});



module.exports = router;