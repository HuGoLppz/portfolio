import { useEffect, useRef, useState } from "react";

import Icon from "../Common/Icon";
const Navbar = ({ content, locale, theme, toggleTheme, toggleLocale }) => {
  const { navigation, profile, sections } = content;
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);  const [active, setActive] = useState("inicio");
  const brandRef = useRef(null);
  const linksRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      setSolid(window.scrollY > 24);    };

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const measure = () => {
      const brand = brandRef.current;
      const links = linksRef.current;

      if (!brand || !links || links.offsetParent === null) {
        return;
      }

      const shift = links.offsetLeft - brand.offsetLeft;

      links.style.setProperty("--links-shift", `${Math.max(shift, 0)}px`);
    };

    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);

    return () => window.removeEventListener("resize", measure);
  }, [locale, content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-45% 0px -50% 0px",
      },
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);

      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    document.body.classList.toggle("is-locked", open);

    const onKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header>
      <nav
        className={"nav" + (solid || open ? " nav--solid" : "")}
        aria-label={navigation.mainLabel}
      >
        <div className="wrap nav__inner">
          <span ref={brandRef} className="nav__brand">
            {profile.name}
          </span>
          <ul ref={linksRef} className="nav__links">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  className="nav__link"
                  href={`#${section.id}`}
                  aria-current={active === section.id ? "true" : undefined}
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="nav__actions">
            <button
              className="iconbtn languaje"
              onClick={toggleLocale}
              aria-label={
                locale === "es"
                  ? navigation.languageEnglish
                  : navigation.languageSpanish
              }
            >
              {locale === "es" ? "Es" : "En"}
            </button>

            <button
              className="iconbtn"
              onClick={toggleTheme}
              aria-label={
                theme === "dark" ? navigation.lightTheme : navigation.darkTheme
              }
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} />
            </button>

            <button
              className="iconbtn nav__burger"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="menu-movil"
              aria-label={open ? navigation.closeMenu : navigation.openMenu}
            >
              <Icon name={open ? "close" : "menu"} size={20} />
            </button>
          </div>
        </div>
      </nav>

      {open && (
        <div className="drawer" id="menu-movil">
          {sections.map((section) => (
            <a
              key={section.id}
              className="drawer__link"
              href={`#${section.id}`}
              onClick={() => setOpen(false)}
            >
              {section.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
