import {
  Scissors,
  Coffee,
  UtensilsCrossed,
  Wine,
  Dumbbell,
  Activity,
  Heart,
  Book,
  ShoppingBag,
  Home,
  Briefcase,
  MapPin,
  Music,
  Film,
  Camera,
  Car,
  GraduationCap,
  CreditCard,
  Tag,
} from "@/app/lib/icons";
import React from "react";

export const getCategoryIcon = (
  category: string,
  subInterestId?: string,
  subInterestLabel?: string
): React.ComponentType<React.SVGProps<SVGSVGElement>> => {
  const normalizedCategory = (category || "").toLowerCase();
  const normalizedSubInterest = (subInterestId || subInterestLabel || "").toLowerCase();
  const searchTerm = normalizedSubInterest || normalizedCategory;

  if (searchTerm.includes("salon") || searchTerm.includes("hairdresser") || searchTerm.includes("nail")) return Scissors;
  if (searchTerm.includes("cafe") || searchTerm.includes("coffee")) return Coffee;
  if (searchTerm.includes("restaurant") || searchTerm.includes("dining") || searchTerm.includes("food")) return UtensilsCrossed;
  if (searchTerm.includes("bar") || searchTerm.includes("pub")) return Wine;
  if (searchTerm.includes("gym") || searchTerm.includes("fitness") || searchTerm.includes("workout")) return Dumbbell;
  if (searchTerm.includes("spa") || searchTerm.includes("wellness") || searchTerm.includes("massage")) return Activity;
  if (searchTerm.includes("health") || searchTerm.includes("medical")) return Heart;
  if (searchTerm.includes("shop") || searchTerm.includes("store") || searchTerm.includes("retail") || searchTerm.includes("fashion") || searchTerm.includes("clothing")) return ShoppingBag;
  if (searchTerm.includes("book") || searchTerm.includes("library")) return Book;
  if (searchTerm.includes("education") || searchTerm.includes("school") || searchTerm.includes("learn")) return GraduationCap;
  if (searchTerm.includes("finance") || searchTerm.includes("bank") || searchTerm.includes("insurance")) return CreditCard;
  if (searchTerm.includes("business") || searchTerm.includes("office") || searchTerm.includes("professional")) return Briefcase;
  if (searchTerm.includes("music") || searchTerm.includes("concert") || searchTerm.includes("venue")) return Music;
  if (searchTerm.includes("movie") || searchTerm.includes("cinema") || searchTerm.includes("theater") || searchTerm.includes("theatre")) return Film;
  if (searchTerm.includes("photo") || searchTerm.includes("photography") || searchTerm.includes("camera")) return Camera;
  if (searchTerm.includes("car") || searchTerm.includes("auto") || searchTerm.includes("vehicle") || searchTerm.includes("transport")) return Car;
  if (searchTerm.includes("travel") || searchTerm.includes("hotel") || searchTerm.includes("accommodation")) return MapPin;
  if (searchTerm.includes("home") || searchTerm.includes("house") || searchTerm.includes("property") || searchTerm.includes("real estate")) return Home;

  return Tag;
};
