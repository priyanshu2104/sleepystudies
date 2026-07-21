import Hero from "@/components/home/Hero";
import SubjectGrid from "@/components/home/SubjectGrid";
import Stats from "@/components/home/Stats";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main>
      <Hero />

      <SubjectGrid />

      <Stats />

      <Footer />

    </main>
  );
}