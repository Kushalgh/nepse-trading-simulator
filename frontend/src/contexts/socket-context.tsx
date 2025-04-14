"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
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

      // Join user-specific room
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
      // Handle stock updates
      console.log("Stock update:", data);
    });

    socketInstance.on("portfolioUpdate", (data) => {
      // Handle portfolio updates
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

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user, toast]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
