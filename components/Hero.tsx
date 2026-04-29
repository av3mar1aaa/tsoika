import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative h-[78vh] min-h-[480px] w-full overflow-hidden">
      <Image
        src="/hero.png"
        alt="Десерты Tsoika"
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{
          filter: "brightness(1.02) saturate(1.08) contrast(1.04)",
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.25)_0%,_rgba(252,231,239,0)_55%,_rgba(244,166,192,0.18)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-rose-50" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <h1
          className="font-display tracking-tight text-7xl sm:text-8xl md:text-9xl"
          style={{
            color: "#5f1f3e",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            textShadow:
              "0 2px 24px rgba(255,249,251,0.7), 0 1px 3px rgba(95,31,62,0.18)",
          }}
        >
          Tsoika
        </h1>
        <p
          className="mt-3 font-display italic text-xl sm:text-2xl md:text-3xl"
          style={{
            color: "#8e3a5f",
            letterSpacing: "0.02em",
            textShadow: "0 1px 14px rgba(255,249,251,0.85)",
          }}
        >
          кулинарное волшебство
        </p>
      </div>
    </section>
  );
}
