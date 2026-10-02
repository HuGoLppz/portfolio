import Reveal from "./Reveal";

const SectionHead = ({ title, lead }) => {
  return (
    <Reveal className="section__head">
      <h2>{title}</h2>
      {lead && <p className="section__lead">{lead}</p>}
    </Reveal>
  );
};

export default SectionHead;