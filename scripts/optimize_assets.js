const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

async function optimizeImages() {
  const baseDir = path.resolve(__dirname, "..");
  
  // 1. Optimize About image (6MB PNG -> ~90KB WebP)
  const aboutImgIn = path.join(baseDir, "public/images/about/1788095083595-Gemini_Generated_Image_v8xcs2v8xcs2v8xc.png");
  const aboutImgOut = path.join(baseDir, "public/images/about/profile-showcase.webp");
  
  if (fs.existsSync(aboutImgIn)) {
    console.log("Compressing about image...");
    await sharp(aboutImgIn)
      .resize(1200, 1500, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(aboutImgOut);
    console.log("Created:", aboutImgOut, "Size:", fs.statSync(aboutImgOut).size, "bytes");
  }

  // 2. Optimize Personal Cube textures to lightweight WebP
  const personalDir = path.join(baseDir, "public/images/personal");
  const cubeFiles = ["cube-front.png", "cube-creative.png", "cube-lifestyle.png", "cube-code.png", "cube-studio.png"];
  
  for (const file of cubeFiles) {
    const filePath = path.join(personalDir, file);
    const webpPath = path.join(personalDir, file.replace(".png", ".webp"));
    if (fs.existsSync(filePath)) {
      await sharp(filePath)
        .resize(800, 800, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(webpPath);
      console.log("Optimized cube texture:", webpPath, "Size:", fs.statSync(webpPath).size, "bytes");
    }
  }

  // 3. Delete raw .orig.png backup files and unused 8MB raw test files
  const filesToDelete = [
    "public/images/personal/avatar.orig.png",
    "public/images/personal/cube-code.orig.png",
    "public/images/personal/cube-creative.orig.png",
    "public/images/personal/cube-front.orig.png",
    "public/images/personal/cube-lifestyle.orig.png",
    "public/images/personal/cube-studio.orig.png",
    "public/images/about/1788095083595-Gemini_Generated_Image_v8xcs2v8xcs2v8xc.png",
    "public/images/personal/1788199803775-Gemini_Generated_Image_51r5xz51r5xz51r5.png",
    "public/images/personal/1788200593404-Gemini_Generated_Image_l34h2xl34h2xl34h.png",
    "public/images/personal/1788201708871-Gemini_Generated_Image_rrywterrywterryw.png",
    "public/images/personal/1788202301544-Gemini_Generated_Image_xt7mccxt7mccxt7m.png",
    "public/images/personal/1788204414596-Gemini_Generated_Image_hyzom8hyzom8hyzo.png"
  ];

  for (const relPath of filesToDelete) {
    const fullPath = path.join(baseDir, relPath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log("Deleted unused heavy file:", relPath);
    }
  }
}

optimizeImages().catch(console.error);
