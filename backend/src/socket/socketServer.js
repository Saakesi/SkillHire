// src/socket/socketServer.js
import { Server } from "socket.io";

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin:      "http://localhost:5173",
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("WS client connected:", socket.id);

    // Frontend joins its own room by githubId
    socket.on("join", (githubId) => {
      socket.join(githubId);
      console.log(`Socket ${socket.id} joined room ${githubId}`);
    });

    socket.on("disconnect", () => {
      console.log("WS client disconnected:", socket.id);
    });
  });

  return io;
}

// Called from the worker to push progress to the right user
export function emitProgress(githubId, data) {
  if (!io) return;
  io.to(githubId).emit("analysisProgress", data);
}


/*
// Frontend — connect and listen (React)
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", { withCredentials: true });

// After triggering analysis:
socket.emit("join", githubId);

socket.on("analysisProgress", ({ stage, pct }) => {
  setProgress(pct);       // update progress bar
  setStage(stage);        // "Fetching repos..." etc
  if (stage === "completed") {
    fetchAnalysis();      // pull final results
  }
});*/