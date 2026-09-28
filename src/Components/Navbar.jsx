import { useEffect, useState } from "react";

import Icon from "./Icon";
import { PROFILE, SECTIONS } from "../Data/portfolio";

const Navbar = ({ theme, toggleTheme }) => {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState("inicio");

  useEffect(() => {
    const onScroll = () => {
      setSolid(window.scrollY > 24);
    };

    onScroll();

    window.addEventListener(
      "scroll",
      onScroll,
      { passive: true }
    );

    return () =>
      window.removeEventListener(
        "scroll",
        onScroll
      );
  }, []);

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
      }
    );

    SECTIONS.forEach(({ id }) => {
      const element =
        document.getElementById(id);

      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle(
      "is-locked",
      open
    );

    const onKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () =>
      window.removeEventListener(
        "keydown",
        onKey
      );
  }, [open]);

  return (
    <header>
      <nav
        className={
          "nav" +
          (solid || open
            ? " nav--solid"
            : "")
        }
        aria-label="Navegación principal"
      >
        <div className="wrap nav__inner">
          <a
            className="nav__brand"
            href="#inicio"
            onClick={() => setOpen(false)}
          >
            <span
              className="nav__mark"
              aria-hidden="true"
            >
              {PROFILE.initials}
            </span>

            {PROFILE.name}
          </a>

          <ul className="nav__links">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  className="nav__link"
                  href={`#${section.id}`}
                  aria-current={
                    active === section.id
                      ? "true"
                      : undefined
                  }
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="nav__actions">
            <button
              className="iconbtn"
              onClick={toggleTheme}
              aria-label={
                theme === "dark"
                  ? "Activar tema claro"
                  : "Activar tema oscuro"
              }
            >
              <Icon
                name={
                  theme === "dark"
                    ? "sun"
                    : "moon"
                }
              />
            </button>

            <button
              className="iconbtn nav__burger"
              onClick={() =>
                setOpen((value) => !value)
              }
              aria-expanded={open}
              aria-controls="menu-movil"
              aria-label={
                open
                  ? "Cerrar menú"
                  : "Abrir menú"
              }
            >
              <Icon
                name={
                  open
                    ? "close"
                    : "menu"
                }
                size={20}
              />
            </button>
          </div>
        </div>
      </nav>

      {open && (
        <div
          className="drawer"
          id="menu-movil"
        >
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              className="drawer__link"
              href={`#${section.id}`}
              onClick={() =>
                setOpen(false)
              }
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
