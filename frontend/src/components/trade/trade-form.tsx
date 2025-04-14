"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { useSocket } from "@/contexts/socket-context";
import { useStockPrice } from "@/hooks/use-stock-price";
import { api } from "@/lib/api";
import type { PortfolioStock } from "@/types";
import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface TradeFormProps {
  type: "market" | "limit";
  symbol: string;
  cashBalance: number;
  portfolio: PortfolioStock[];
}

export function TradeForm({
  type,
  symbol,
  cashBalance,
  portfolio,
}: TradeFormProps) {
  const [action, setAction] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState<number>(1);
  const [limitPrice, setLimitPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [estimatedTotal, setEstimatedTotal] = useState<number>(0);
  const [estimatedFee, setEstimatedFee] = useState<number>(0);

  const { price, isLoading: priceLoading } = useStockPrice(symbol);
  const { socket } = useSocket();
  const { toast } = useToast();

  const currentStock = portfolio.find((stock) => stock.symbol === symbol);
  const FEE_RATE = 0.004; // From constants

  useEffect(() => {
    if (price && !limitPrice && type === "limit") {
      setLimitPrice(price);
    }
  }, [price, limitPrice, type]);

  useEffect(() => {
    const tradePrice = type === "market" ? price : limitPrice;
    if (tradePrice) {
      const subtotal = tradePrice * quantity;
      const fee = subtotal * FEE_RATE;
      setEstimatedFee(fee);
      setEstimatedTotal(action === "buy" ? subtotal + fee : subtotal - fee);
    }
  }, [price, limitPrice, quantity, action, type]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    } else {
      setQuantity(1);
    }
  };

  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setLimitPrice(value);
    } else {
      setLimitPrice(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (type === "market") {
        const endpoint = action === "buy" ? "/trade/buy" : "/trade/sell";
        await api.post(endpoint, { symbol, quantity });
      } else {
        await api.post("/trade/limit", {
          symbol,
          quantity,
          limitPrice,
          action,
        });
      }

      toast({
        title: "Order submitted",
        description: `Your ${action} order for ${quantity} ${symbol} has been ${
          type === "market" ? "executed" : "placed"
        }.`,
      });

      // Reset form
      setQuantity(1);
      if (type === "limit") {
        setLimitPrice(price);
      }
    } catch (error: any) {
      toast({
        title: "Order failed",
        description:
          error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const insufficientFunds = action === "buy" && estimatedTotal > cashBalance;
  const insufficientShares =
    action === "sell" && (!currentStock || currentStock.quantity < quantity);
  const disableSubmit =
    isLoading ||
    priceLoading ||
    insufficientFunds ||
    insufficientShares ||
    (type === "limit" && !limitPrice);

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <RadioGroup
          defaultValue="buy"
          className="flex space-x-4"
          value={action}
          onValueChange={(value) => setAction(value as "buy" | "sell")}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="buy" id="buy" />
            <Label htmlFor="buy" className="flex items-center">
              <ArrowDownLeft className="mr-1 h-4 w-4 text-green-500" />
              Buy
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sell" id="sell" />
            <Label htmlFor="sell" className="flex items-center">
              <ArrowUpRight className="mr-1 h-4 w-4 text-red-500" />
              Sell
            </Label>
          </div>
        </RadioGroup>

        <div className="grid gap-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={handleQuantityChange}
          />
        </div>

        {type === "limit" && (
          <div className="grid gap-2">
            <Label htmlFor="limitPrice">Limit Price ($)</Label>
            <Input
              id="limitPrice"
              type="number"
              min="0.01"
              step="0.01"
              value={limitPrice || ""}
              onChange={handleLimitPriceChange}
              placeholder={priceLoading ? "Loading..." : "Enter limit price"}
            />
          </div>
        )}

        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Price:</span>
              <span>
                {priceLoading
                  ? "Loading..."
                  : `$${price?.toLocaleString() || "N/A"}`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Quantity:</span>
              <span>{quantity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fee (0.4%):</span>
              <span>${estimatedFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Estimated Total:</span>
              <span>${estimatedTotal.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {action === "buy" && (
          <div className="text-sm">
            <span className="text-muted-foreground">Available Cash: </span>
            <span
              className={insufficientFunds ? "text-red-500 font-medium" : ""}
            >
              ${cashBalance.toLocaleString()}
            </span>
          </div>
        )}

        {action === "sell" && (
          <div className="text-sm">
            <span className="text-muted-foreground">Available Shares: </span>
            <span
              className={insufficientShares ? "text-red-500 font-medium" : ""}
            >
              {currentStock ? currentStock.quantity : 0}
            </span>
          </div>
        )}

        {insufficientFunds && (
          <motion.p
            className="text-sm text-red-500"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Insufficient funds for this transaction
          </motion.p>
        )}

        {insufficientShares && (
          <motion.p
            className="text-sm text-red-500"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Insufficient shares for this transaction
          </motion.p>
        )}

        <Button type="submit" className="w-full" disabled={disableSubmit}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `${action === "buy" ? "Buy" : "Sell"} ${symbol} ${
              type === "limit" ? "at $" + limitPrice : ""
            }`
          )}
        </Button>
      </div>
    </form>
  );
}
