import { useCallback, useEffect, useRef, useState } from "react";

import Navbar from "./Components/Layout/Navbar.jsx";
import Hero from "./Components/Hero/Hero.jsx";
import About from "./Components/Sections/About.jsx";
import Education from "./Components/Sections/Education.jsx";
import Skills from "./Components/Sections/Skills.jsx";
import Projects from "./Components/Sections/Projects.jsx";
import Contact from "./Components/Sections/Contact.jsx";
import Footer from "./Components/Layout/Footer.jsx";
import { DEFAULT_LOCALE, getPortfolio } from "./Data/portfolio.js";

function App() {
  const [theme, setTheme] = useState("dark");
  const [locale, setLocale] = useState(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);
  const flags = useRef({ page: false, fonts: false, character: false });
  const check = useRef(() => {});
  const onCharacterReady = useCallback(() => {
    flags.current.character = true;
    check.current();
  }, []);
  const portfolio = getPortfolio(locale);

  useEffect(() => {
    let saved = null;

    try {
      saved = localStorage.getItem("hl-theme");
    } catch {}

    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    setTheme(saved || (prefersDark ? "dark" : "light"));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    try {
      localStorage.setItem("hl-theme", theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // Nada se muestra hasta que carguen recursos de la página, fuentes y modelo 3D.
  useEffect(() => {
    const f = flags.current;
    check.current = () => {
      if (f.page && f.fonts && f.character) setReady(true);
    };
    const mark = (key) => () => {
      f[key] = true;
      check.current();
    };

    if (document.readyState === "complete") f.page = true;
    else window.addEventListener("load", mark("page"), { once: true });

    const fonts = document.fonts
      ? Promise.all([
          document.fonts.load('1em "Bricolage Grotesque"'),
          document.fonts.load('1em "Newsreader"'),
        ])
      : Promise.resolve();
    fonts.catch(() => {}).then(mark("fonts"));

    check.current();
    const fallback = setTimeout(() => setReady(true), 8000); // por si algo no responde
    return () => clearTimeout(fallback);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("is-loading", !ready);
    if (!ready) return undefined;
    const loader = document.getElementById("boot-loader");
    loader?.classList.add("is-done");
    const t = setTimeout(() => loader?.remove(), 700);
    return () => clearTimeout(t);
  }, [ready]);

  const toggleTheme = useCallback(() => {
    setTheme((current) =>
      current === "dark" ? "light" : "dark"
    );
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale((current) => (current === "es" ? "en" : "es"));
  }, []);

  return (
    <>
      <Navbar
        content={portfolio}
        locale={locale}
        theme={theme}
        toggleTheme={toggleTheme}
        toggleLocale={toggleLocale}
      />

      <main id="main">
        <Hero content={portfolio} onCharacterReady={onCharacterReady} />
        <About content={portfolio} />
        <Education content={portfolio} />
        <Skills content={portfolio} />
        <Projects content={portfolio} />
        <Contact content={portfolio} />
      </main>

      <Footer content={portfolio} />
    </>
  );
}

export default App;
