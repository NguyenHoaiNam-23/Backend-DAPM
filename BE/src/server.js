const app = require("./app");
const { PORT } = require("./config/app.config");
const { connectDatabase } = require("./database/connection");

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();