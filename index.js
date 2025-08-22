require("dotenv").config();
const express=require("express");
const connectdb = require("./config/db");
const router = require("./routes/route");
const app=express();
const Port=process.env.port || 4000;
const cors=require("cors");
const { upload, deleteFile } = require("./utils");
const path = require("path");


// CORS configuration
const corsConfig = {
  origin: [
      "https://jiligames.oracleapi.co.uk",
    "https://jstlive.net",
    "http://jstlive.net",
    "https://www.jstlive.net",
    "http://www.jstlive.net",
    "www.jstlive.net",
    "jstlive.net",
    "https://lclb.net",
    "https://www.lclb.net",
    "http://lclb.net",
    "http://www.lclb.net",
    "www.lclb.net",
    "lclb.net",
    "https://bajinew.egamings.live",
    "http://bajinew.egamings.live",
    "https://www.bajinew.egamings.live",
    "http://www.bajinew.egamings.live",
    "www.bajinew.egamings.live",
    "bajinew.egamings.live",
    "https://bajinew.oracleapi.net",
    "http://bajinew.oracleapi.net",
    "https://www.bajinew.oracleapi.net",
    "http://www.bajinew.oracleapi.net",
    "bajinew.oracleapi.net",
    "http://localhost:5173",
    "http://localhost:5174",
    "https://joy9.live",
    "http://joy9.live",
    "joy9.live",
    "https://www.joy9.live",
    "http://www.joy9.live",
    "www.joy9.live",
    // "https://comokbaji.com",
    // "http://comokbaji.com",
    // "www.comokbaji.com",
    // "comokbaji.com",
    // "https://moneyeran365.com",
    // "http://moneyeran365.com",
    // "www.moneyeran365.com",
    // "moneyeran365.com",
    // "https://1xkhela.com",
    // "http://1xkhela.com",
    // "www.1xkhela.com",
    // "1xkhela.com",
    "https://trickbaz.com",
    "http://trickbaz.com",
    "www.trickbaz.com",
    "trickbaz.com",
    "https://thebethd.com",
    // "https://baji.oracletechnology.net",
    // "http://baji.oracletechnology.net",
    // "www.baji.oracletechnology.net",
    // "baji.oracletechnology.net",
    "*",
  ],
  credentials: true,
  optionSuccessStatus: 200,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
};


// middlewares
app.use(cors(corsConfig));
app.options("", cors(corsConfig));
app.use(express.json());


    
  

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



// Routes for image upload and delete
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.status(200).json({
    message: "File uploaded successfully",
    filePath: `uploads/images/${req.file.filename}`,
  });
});

app.delete("/delete", async (req, res) => {
  const { filePath } = req.body;

  if (!filePath) {
    return res.status(400).json({ error: "File path not provided" });
  }

  try {
    await deleteFile(filePath);
    res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


app.use("/api/game",router);
app.use(express.static("public"))
connectdb();
app.get("/",(req,res)=>{
    try {
        res.send("This is Game server")
    } catch (error) {
        console.log(error)
    }
});

app.listen(Port,()=>{
    console.log(`Servr is running one ${Port}`)
})