import Reveal from "./Reveal";

const SectionHead = ({ kicker, title, lead }) => {
  return (
    <Reveal className="section__head">
      <span className="section__kicker">{kicker}</span>
      <h2>{title}</h2>
      {lead && <p className="section__lead">{lead}</p>}
    </Reveal>
  );
};

export default SectionHead;