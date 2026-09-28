import Icon from "./Icon";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import { CONTACT } from "../Data/portfolio";

const isPlaceholder = (value) =>
  !value || value.trim().startsWith("[");

const Contact = ({ content }) => {
  const { contact: contactText } = content;
  const items = [
    {
      icon: "mail",
      label: contactText.labels.email,
      value: CONTACT.email,
      href: isPlaceholder(CONTACT.email)
        ? null
        : "mailto:" + CONTACT.email,
    },
    {
      icon: "linkedin",
      label: contactText.labels.linkedin,
      value: CONTACT.linkedin,
      href: isPlaceholder(CONTACT.linkedin)
        ? null
        : CONTACT.linkedin,
    },
    {
      icon: "github",
      label: contactText.labels.github,
      value: CONTACT.github,
      href: isPlaceholder(CONTACT.github)
        ? null
        : CONTACT.github,
    },
  ];

  return (
    <section className="section" id="contacto">
      <div className="wrap">
        <SectionHead
          kicker={contactText.kicker}
          title={contactText.title}
          lead={contactText.lead}
        />

        <div className="contact">
          {items.map((contact, i) => {
            const empty = isPlaceholder(contact.value);

            const inner = (
              <>
                <span
                  className="contact__ico"
                  aria-hidden="true"
                >
                  <Icon name={contact.icon} size={19} />
                </span>

                <span className="contact__label">
                  {contact.label}
                </span>

                <span
                  className={
                    "contact__value" +
                    (empty
                      ? " contact__value--empty"
                      : "")
                  }
                >
                  {contact.value}
                </span>
              </>
            );

            return contact.href ? (
              <Reveal
                key={contact.label}
                as="a"
                className="contact__card"
                delay={i * 80}
                href={contact.href}
                target={
                  contact.icon === "mail"
                    ? undefined
                    : "_blank"
                }
                rel="noopener noreferrer"
                aria-label={
                  contact.label + ": " + contact.value
                }
              >
                {inner}
              </Reveal>
            ) : (
              <Reveal
                key={contact.label}
                className="contact__card"
                delay={i * 80}
              >
                {inner}
              </Reveal>
            );
          })}
        </div>

        <Reveal className="cta">
          <div>
            <h3>{contactText.ctaTitle}</h3>
            <p>{contactText.ctaText}</p>
          </div>

          {isPlaceholder(CONTACT.email) ? (
            <button
              className="btn btn--primary"
              disabled
            >
              {contactText.sendEmail}
            </button>
          ) : (
            <a
              className="btn btn--primary"
              href={"mailto:" + CONTACT.email}
            >
              {contactText.sendEmail}
              <Icon name="arrow" size={17} />
            </a>
          )}
        </Reveal>
      </div>
    </section>
  );
};

export default Contact;
