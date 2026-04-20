import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error("Использование: npx tsx scripts/set-password.ts <пароль>");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
const secret = crypto.randomBytes(32).toString("hex");

console.log("Скопируйте в .env.local:\n");
const escapedHash = hash.replace(/\$/g, "\\$");

console.log(`ADMIN_USERNAME=admin`);
console.log(`ADMIN_PASSWORD_HASH=${escapedHash}`);
console.log(`SESSION_SECRET=${secret}`);
console.log(
  "\nВажно: экранирование \\$ обязательно — иначе парсер .env примет $2b, $12 за подстановку переменных.",
);
