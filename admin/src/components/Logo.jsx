import logo from "../assets/logo.jpg";

export default function Logo({ className = "h-10" }) {
  return <img src={logo} alt="SEL Tiger Sahayak" className={className} />;
}
