export const CONTACTS = {
  phone: "+79112136768",
  phoneDisplay: "+7 (911) 213-67-68",
  telegramUsername: "Lenkatsoika",
};

export function telegramOrderUrl(productName: string): string {
  const text = `Здравствуйте! Хочу заказать «${productName}»`;
  return `https://t.me/${CONTACTS.telegramUsername}?text=${encodeURIComponent(text)}`;
}

export function telegramProfileUrl(): string {
  return `https://t.me/${CONTACTS.telegramUsername}`;
}
