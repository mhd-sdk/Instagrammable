export default {
  devServer: {
    cors: {
      origin: [
        "http://localhost:3000",
        "https://unvitrescent-barton-unconditionally.ngrok-free.dev"
      ],
      credentials: true,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"]
    }
  }
};
