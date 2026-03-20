import React from "react";
import { Scissors, Coffee, UtensilsCrossed, Wine, Dumbbell, Activity, Heart, Book, ShoppingBag, Home, Briefcase, MapPin, Music, Film, Camera, Car, GraduationCap, CreditCard, Tag } from "@/app/lib/icons";

// Tiny 4x3 SVG matching the card error-state bg (#E5E0E5)
export const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSIzIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjMiIGZpbGw9IiNlNWUwZTUiLz48L3N2Zz4=";

// Map categories to lucide-react icons (normalize only for icon selection)
export const getCategoryIcon = (category: string): React.ComponentType<React.SVGProps<SVGSVGElement>> => {
  const normalizedCategory = (category || '').toLowerCase();
  const searchTerm = normalizedCategory;

  if (searchTerm.includes('salon') || searchTerm.includes('hairdresser') || searchTerm.includes('nail')) return Scissors;
  if (searchTerm.includes('cafe') || searchTerm.includes('coffee')) return Coffee;
  if (searchTerm.includes('restaurant') || searchTerm.includes('dining') || searchTerm.includes('food') || searchTerm.includes('drink')) return UtensilsCrossed;
  if (searchTerm.includes('bar') || searchTerm.includes('pub')) return Wine;
  if (searchTerm.includes('gym') || searchTerm.includes('fitness') || searchTerm.includes('workout')) return Dumbbell;
  if (searchTerm.includes('spa') || searchTerm.includes('wellness') || searchTerm.includes('massage')) return Activity;
  if (searchTerm.includes('health') || searchTerm.includes('medical')) return Heart;
  if (searchTerm.includes('shop') || searchTerm.includes('store') || searchTerm.includes('retail') || searchTerm.includes('fashion') || searchTerm.includes('clothing')) return ShoppingBag;
  if (searchTerm.includes('book') || searchTerm.includes('library')) return Book;
  if (searchTerm.includes('education') || searchTerm.includes('school') || searchTerm.includes('learn')) return GraduationCap;
  if (searchTerm.includes('finance') || searchTerm.includes('bank') || searchTerm.includes('insurance')) return CreditCard;
  if (searchTerm.includes('business') || searchTerm.includes('office') || searchTerm.includes('professional')) return Briefcase;
  if (searchTerm.includes('music') || searchTerm.includes('concert') || searchTerm.includes('venue')) return Music;
  if (searchTerm.includes('movie') || searchTerm.includes('cinema') || searchTerm.includes('theater') || searchTerm.includes('theatre')) return Film;
  if (searchTerm.includes('art') || searchTerm.includes('gallery') || searchTerm.includes('museum')) return Camera;
  if (searchTerm.includes('travel') || searchTerm.includes('transport') || searchTerm.includes('hotel')) return MapPin;
  if (searchTerm.includes('car') || searchTerm.includes('auto') || searchTerm.includes('vehicle')) return Car;
  if (searchTerm.includes('home') || searchTerm.includes('decor') || searchTerm.includes('furniture')) return Home;
  return Tag;
};
