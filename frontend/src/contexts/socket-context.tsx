"use client";

import type React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "./auth-context";
import { useToast } from "@/hooks/use-toast";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null); // Use useRef to persist socket instance
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // If no user, disconnect and clean up
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Avoid creating a new socket if one already exists
    if (socketRef.current) {
      return;
    }

    // Connect to WebSocket server
    const socketInstance = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
      {
        auth: {
          token: localStorage.getItem("token"),
        },
      }
    );

    socketInstance.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
      socketInstance.emit("join", { userId: user.id });
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socketInstance.on("error", (error) => {
      console.error("Socket error:", error);
    });

    // Handle real-time events
    socketInstance.on("stockUpdate", (data) => {
      console.log("Stock update:", data);
    });

    socketInstance.on("portfolioUpdate", (data) => {
      console.log("Portfolio update:", data);
    });

    socketInstance.on("orderMatched", (data) => {
      toast({
        title: "Order Matched",
        description: `Your order for ${data.transaction.quantity} ${data.transaction.stock.symbol} has been matched.`,
        variant: "success",
      });
    });

    socketInstance.on("orderExecuted", (data) => {
      toast({
        title: "Order Executed",
        description: `Your limit order for ${data.order.quantity} ${data.order.stock.symbol} has been executed.`,
        variant: "success",
      });
    });

    socketInstance.on("orderCancelled", (data) => {
      toast({
        title: "Order Cancelled",
        description: `Your order has been cancelled.`,
        variant: "info",
      });
    });

    socketInstance.on("achievementEarned", (data) => {
      toast({
        title: "Achievement Unlocked!",
        description: `You've earned the "${data.achievement.name}" achievement!`,
        variant: "success",
      });
    });

    socketRef.current = socketInstance; // Store in useRef, no state update

    // Cleanup on unmount or when user changes
    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [user]); // Depend only on user

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
