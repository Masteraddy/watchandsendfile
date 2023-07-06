var chokidar = require("chokidar");
var fs = require("fs");
var axios = require("axios");

const WATCH_DIR = "watch/watch";
const SAVINGURL = "https://mttest-masteraddy.vercel.app/api/meet";

var watcher = chokidar.watch(WATCH_DIR, { ignored: /^\./, persistent: true });

function extractEmails(text) {
  return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
}

watcher
  .on("add", function (path) {
    console.log("File", path, "has been added");
    const filecontent = fs.readFileSync(path, { encoding: "utf8", flag: "r" });
    const email = extractEmails(filecontent);
    if (!email) return;
    const host = email[0].split("@")[1];
    const room = email[0].split("@")[0];
    const realHost = host.replace("conference.", "");
    const link = `https://${realHost}/${path}`;
    let fileLink = {
      host: host.replace("conference.", ""),
      room: room,
      path: path,
      link: link,
    };
    console.log(link);
    // send to server
    axios
      .post(SAVINGURL, fileLink)
      .then((res) => console.log("Success"))
      .catch((error) => console.error(error?.response?.data));
  })
  .on("change", function (path) {
    console.log("File", path, "has been changed");
  })
  .on("unlink", function (path) {
    console.log("File", path, "has been removed");
  })
  .on("error", function (error) {
    console.error("Error happened", error);
  });
