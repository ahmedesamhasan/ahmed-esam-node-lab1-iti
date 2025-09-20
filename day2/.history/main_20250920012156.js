// const path = require("path");
import  { newFun}  from "./try/index.js";

// const fs = require("fs").promises;
// const newFun = require("./try/index").newFun;
// const _ = require("lodash")
// const data ={name: "MENNA", age: 12};
// const copy = {...data}
// const removedFields = ["age", "name"]
// if(data.age) {
//     delete copy.age;
// }
// console.log("🚀 ~ data:", copy)

// console.log(_.omit(data, ["age"]));

console.log("🚀 ~ newFun:", newFun());
// const data = fs.readFileSync("file.txt", "utf-8");
// console.log("🚀 ~ data:", data)
// async function x (){
// const asyncData = await fs.readFile("file.txt", "utf-8");
// console.log("🚀 ~ asyncData:", asyncData)

// }
//  x();

// const OurPath = path.join(__dirname, "folder", "file.txt");
// console.log(OurPath);

// console.log(path.basename(OurPath));

// console.log("Hello, World!");
// global.myGlobalVar = "This is a global variable";
// console.log(global);
// console.log(__dirname);
// console.log(__filename);
// console.log(process.env);
// console.log(process.argv);

// setTimeout(() => {
//   console.log("This message is displayed after 2 seconds");
// }, 2000);
// console.log("End of the script");

// const interval = setInterval(() => {
//   console.log("This message is displayed every 2 seconds");
// }, 2000);

// // const x = () => clearInterval(interval);
// // setTimeout(x, 10000);

// setTimeout((x)=>{
//     console.log("Hello from the future", x);
// }, 5000, "menna")

// console.log("End of the script");

// setImmediate(() => {
//   console.log("This message is displayed immediately after the current event loop");
// })
// main.js
import http from "http";
import * as repo from "./usersRepo.js";

function send(res, code, body) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(body === undefined ? "" : JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", c => raw += c);
    req.on("end", () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); }
      catch { reject(new Error("Invalid JSON"));}
    });
  });
}

const server = http.createServer(async (req, res) => {
  // CORS خفيف للتجارب
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return send(res, 204);

  try {
    const url = new URL(req.url, "http://localhost");
    const parts = url.pathname.split("/").filter(Boolean); // ['users','1']

    // GET /users
    if (req.method === "GET" && url.pathname === "/users") {
      return send(res, 200, await repo.getAll());
    }

    // GET /users/:id
    if (req.method === "GET" && parts[0] === "users" && parts[1]) {
      const user = await repo.getOne(Number(parts[1]));
      return user ? send(res, 200, user) : send(res, 404, { error: "not found" });
    }

    // POST /users  { name }
    if (req.method === "POST" && url.pathname === "/users") {
      const { name } = await readJson(req);
      if (!name) return send(res, 400, { error: "name required" });
      const user = await repo.create(name);
      return send(res, 201, user);
    }

    // PUT/PATCH /users/:id  { name }
    if ((req.method === "PUT" || req.method === "PATCH") && parts[0] === "users" && parts[1]) {
      const { name } = await readJson(req);
      if (!name) return send(res, 400, { error: "name required" });
      const user = await repo.update(Number(parts[1]), name);
      return user ? send(res, 200, user) : send(res, 404, { error: "not found" });
    }

    // DELETE /users/:id
    if (req.method === "DELETE" && parts[0] === "users" && parts[1]) {
      const ok = await repo.removeOne(Number(parts[1]));
      return ok ? send(res, 204) : send(res, 404, { error: "not found" });
    }

    return send(res, 404, { error: "route not found" });
  } catch (err) {
    return send(res, 500, { error: err.message || "server error" });
  }
});

server.listen(3000, () => console.log("Server → http://localhost:3000"));
