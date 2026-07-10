import { useState } from "react";
import { Preloader } from "./components/Preloader";
import { Cursor } from "./components/Cursor";
import { Nav } from "./components/Nav";
import { Rail } from "./components/Rail";
import { Hero } from "./components/Hero";
import { Work } from "./components/Work";
import { Philosophy } from "./components/Philosophy";
import { Capabilities } from "./components/Capabilities";
import { Experience } from "./components/Experience";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";

export default function App() {
  const [ready, setReady] = useState(false);

  return (
    <>
      <a className="skip-link" href="#work">
        Skip to work
      </a>
      <Preloader onDone={() => setReady(true)} />
      <Cursor />
      <Nav />
      <Rail />
      <main>
        <Hero ready={ready} />
        <Work />
        <Philosophy />
        <Capabilities />
        <Experience />
        <Contact />
      </main>
      <Footer />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
