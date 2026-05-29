import app from "./app.js";
import "dotenv/config";

const SERVER_PORT = process.env.SERVER_PORT;

console.log(SERVER_PORT);
app.listen(SERVER_PORT, () => {
  console.log(`Backend escuchando en el puerto ${SERVER_PORT}`);
});
