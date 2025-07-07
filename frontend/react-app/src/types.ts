export interface Allergen {
  id_alergenu: number;
  nazev: string;
}

export interface Product {
  id_menu_polozka: number;
  nazev: string;
  popis: string;
  cena: string;
  alergeny: Allergen[];
}
