import { Link } from "react-router-dom";

const AnimatedNavLink = ({ to, text }) => {
  return (
    <Link to={to} className="animated-button" data-text={text}>
      <span className="actual-text">&nbsp;{text}&nbsp;</span>
      <span aria-hidden="true" className="hover-text">
        &nbsp;{text}&nbsp;
      </span>
    </Link>
  );
};

export default AnimatedNavLink;
