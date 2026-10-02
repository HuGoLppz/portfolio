import Icon from "../Common/Icon";
const Footer = ({ content }) => (
  <footer className="footer">
    <div className="wrap footer__inner">
      <p>
        © {new Date().getFullYear()} {content.profile.name}
      </p>

      <p
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: ".4rem",
        }}
      >
        <Icon name="pin" size={14} />
        {content.profile.location}
      </p>
    </div>
  </footer>
);

export default Footer;
