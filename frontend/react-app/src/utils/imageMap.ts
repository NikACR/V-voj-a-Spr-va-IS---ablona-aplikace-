// src/utils/imageMap.ts

/**
 * Mapa ID položky → cesta k obrázku ve složce public/images.
 * Pokud API nevrátí vlastní `obrazek_url`, použijeme sem statický soubor.
 */
export const imageMap: Record<number, string> = {
  1:  '/images/pizza.jpg',
  2:  '/images/hoveziburger.jpg',
  3:  '/images/caesar.jpg',
  4:  '/images/focaccia.jpg',
  5:  '/images/kulajda.jpg',
  6:  '/images/tatarak.jpg',
  7:  '/images/rimskysalat.jpg',
  8:  '/images/zebra.jpg',
  9:  '/images/balltipsteak.jpg',
  10: '/images/cordon.jpg',
  11: '/images/svickova.jpg',
  12: '/images/bramborovenoky.jpg',
  13: '/images/panenka.jpg',
  14: '/images/rizek.jpg',
  15: '/images/trhanyburger.jpg',
  16: '/images/buchty.jpg',
  17: '/images/parisbrest.jpg',
  18: '/images/cremebrulee.jpg',
  19: '/images/craquelin.jpg',
  20: '/images/bountycheesecake.jpg',
  21: '/images/malinovebrownies.jpg',
}

/**
 * Cesta k placeholderu, když by žádný obrázek nebyl dostupný.
 */
export const FALLBACK_IMAGE = '/images/placeholder.png'
