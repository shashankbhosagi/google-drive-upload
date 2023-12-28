const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");
// const { file } = require("googleapis/build/src/apis/file");
const dotenv = require("dotenv");
dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

//! Issue it is creating folder 2 times check why ??
async function createFolder(folderName) {
  try {
    const folderResponse = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
      },
    });
    return folderResponse.data.id;
  } catch (error) {
    console.log(error.message);
    throw error;
  }
}

const filePathModel = path.join(__dirname, "cuterobo.glb");
const filePathImage = path.join(__dirname, "luffy.jpeg");

async function uploadFile() {
  try {
    const folderId = await createFolder("yoshashank");

    const resposeModel = await drive.files.create({
      requestBody: {
        name: "cuterobo.glb",
        mimeType: "model/gltf-binary",
        parents: [folderId],
      },
      media: {
        mimeType: "model/gltf-binary",
        body: fs.createReadStream(filePathModel),
      },
    });
    const resposeImage = await drive.files.create({
      requestBody: {
        name: "luffy.jpeg",
        mimeType: "image/jpeg",
        parents: [folderId],
      },
      media: {
        mimeType: "image/jpeg",
        body: fs.createReadStream(filePathImage),
      },
    });

    console.log(resposeImage.data);
    console.log(resposeModel.data);
  } catch (error) {
    console.log(error.message);
  }
}

uploadFile();

async function generatePublicUrl() {
  try {
    const fileId = "1rolBZhSDqg0aDStPXsKoWYVRyCP0w_kD";
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    const result = await drive.files.get({
      fileId: fileId,
      fields: "webViewLink, webContentLink",
    });
    console.log(result.data);
  } catch (error) {
    console.log(error.message);
  }
}

// generatePublicUrl();
