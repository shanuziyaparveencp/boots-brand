/** Single source of truth for shop contact details and store locations. */

export const shop = {
  name: 'Boots Hyper Market',
  since: 1980,
  email: 'bootsfootwear@gmail.com',
  /** E.164, used for tel: and WhatsApp links. */
  phoneRaw: '+919895451667',
  phoneDisplay: '+91 98954 51667',
  whatsapp: 'https://wa.me/919895451667',
  hours: 'Open daily, 10:00 am - 10:00 pm',
  district: 'Kannur, Kerala',
} as const;

/** Towns we have shops in / deliver to. */
export const storeLocations = [
  'Thalassery',
  'Kannur',
  'Koothuparamba',
  'Nadapuram',
  'Kallachi',
] as const;
