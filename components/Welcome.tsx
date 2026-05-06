import Link from "next/link";

export default function Welcome() {
  return (
    <section className="relative -mt-12 px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <div className="flex justify-center">
          <span
            className="text-2xl text-rose-300"
            aria-hidden="true"
          >
            ❀
          </span>
        </div>

        <h2 className="mt-6 text-center font-display text-4xl font-semibold text-rose-800 sm:text-5xl">
          Здравствуйте!
        </h2>

        <div className="mx-auto mt-3 h-px w-24 bg-gradient-to-r from-transparent via-rose-300 to-transparent" />

        <div className="mt-10 space-y-6 text-base leading-relaxed text-rose-900/85 sm:text-lg sm:leading-loose">
          <p>
            Меня зовут <span className="font-semibold text-rose-800">Лена Цой</span>, я — кондитер.
            Пеку на заказ, готовлю для семьи и близких, пробую новые рецепты и
            делюсь ими, а также обучаю кондитерскому делу.
          </p>

          <p>
            На сайте представлены сладкие рецепты, зачастую простые и из тех
            ингредиентов, что есть под рукой. Порой маленькие кексы, ароматное
            печенье, пирог или торт создают неизгладимое впечатление на наших
            близких, друзей, заказчиков.
          </p>

          <p>
            Люблю, когда в доме пахнет выпечкой — это моё воспоминание с детства,
            когда мама пекла пироги и булочки, а я с нетерпением сидела у духовки.
            До сих пор люблю горячую выпечку больше всего на свете.
          </p>

          <p>
            Моя цель — заразить вас выпечкой и помочь в выборе десерта. Все мы
            разные, но надеюсь, вы найдёте рецепт по вашему вкусу. Пеките на
            радость близким и любимым. Пусть детки закатывают глаза и говорят
            «мм-мм».
          </p>

          <p className="font-display italic text-rose-800">
            Всем ароматной выпечки и домашних посиделок за чаем!
          </p>
        </div>

        <p className="mt-10 text-right font-display text-2xl italic text-rose-700">
          — Лена Цой
        </p>

        <div className="mt-12 flex justify-center">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 rounded-full bg-rose-400 px-7 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-rose-600"
          >
            Посмотреть каталог
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
