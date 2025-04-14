"use client";

import { useSocket } from "@/contexts/socket-context";
import { api } from "@/lib/api";
import type { Stock } from "@/types";
import { useEffect, useState } from "react";
import useSWR from "swr";

export function useStockPrice(symbol: string) {
  const { data, error, isLoading } = useSWR<Stock>(
    symbol ? `/stocks/${symbol}` : null,
    api.fetcher
  );
  const [price, setPrice] = useState<number | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (data) {
      setPrice(data.ltp);
    }
  }, [data]);

  useEffect(() => {
    if (!socket || !symbol) return;

    const handleStockUpdate = (data: { stocks: Stock[] }) => {
      const updatedStock = data.stocks.find((stock) => stock.symbol === symbol);
      if (updatedStock) {
        setPrice(updatedStock.ltp);
      }
    };

    socket.on("stockUpdate", handleStockUpdate);

    return () => {
      socket.off("stockUpdate", handleStockUpdate);
    };
  }, [socket, symbol]);

  return {
    price,
    isLoading,
    isError: error,
  };
}
