import Icon from "./Icon";
import { PROFILE } from "../data/portfolio";

const Footer = () => (
  <footer className="footer">
    <div className="wrap footer__inner">
      <p>
        © {new Date().getFullYear()} {PROFILE.name}
      </p>

      <p
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: ".4rem",
        }}
      >
        <Icon name="pin" size={14} />
        {PROFILE.location}
      </p>
    </div>
  </footer>
);

export default Footer;