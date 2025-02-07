import app from "./server";

try {
  if (!process.env.SERVER_PORT) {
    throw new Error("SERVER_PORT not set in .env file");
  }

  app.listen(process.env.SERVER_PORT, () => {
    console.log("Server running on port", process.env.SERVER_PORT);
  });
} catch (error) {
  console.error("Error starting server: ", error);
}
