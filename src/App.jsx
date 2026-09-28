import { useCallback, useEffect, useState } from "react";

import Navbar from "./Components/Navbar.jsx";
import Hero from "./Components/Hero.jsx";
import About from "./Components/About.jsx";
import Education from "./Components/Education.jsx";
import Skills from "./Components/Skills.jsx";
import Projects from "./Components/Projects.jsx";
import Contact from "./Components/Contact.jsx";
import Footer from "./Components/Footer.jsx";

function App() {
  const [theme, setTheme] = useState("dark");

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

  const toggleTheme = useCallback(() => {
    setTheme((current) =>
      current === "dark" ? "light" : "dark"
    );
  }, []);

  return (
    <>
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main id="main">
        <Hero /> 
        <About />
        <Education />
        <Skills />
        <Projects />
        <Contact />
      </main>

      <Footer />
    </>
  );
}

export default App;
