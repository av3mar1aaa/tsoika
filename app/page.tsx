import Hero from "@/components/Hero";
import Welcome from "@/components/Welcome";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Hero />
      <Welcome />
    </>
  );
}
