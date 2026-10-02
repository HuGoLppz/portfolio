import { useCallback, useEffect, useState } from "react";

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
  const portfolio = getPortfolio(locale);

  useEffect(() => {
    let saved = null;

    try {
      saved = localStorage.getItem("hl-theme");
    } catch (e) {

    }

    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    setTheme(saved || (prefersDark ? "dark" : "light"));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    try {
      localStorage.setItem("hl-theme", theme);
    } catch (e) {
      
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

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
        <Hero content={portfolio} />
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
