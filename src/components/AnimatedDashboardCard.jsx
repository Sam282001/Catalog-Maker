import { FaArrowRightLong } from "react-icons/fa6";

const AnimatedDashboardCard = ({
  icon,
  title,
  description,
  hoverBg,
  hoverText,
}) => {
  return (
    <div
      className="animated-card"
      style={{
        "--hover-bg": hoverBg,
        "--hover-text": hoverText,
      }}
    >
      <div>{icon}</div>
      <strong>{title}</strong>
      <div className="card__body">{description}</div>
      <span>
        {title} <FaArrowRightLong className="ml-2 mt-1" />{" "}
      </span>
    </div>
  );
};

export default AnimatedDashboardCard;
