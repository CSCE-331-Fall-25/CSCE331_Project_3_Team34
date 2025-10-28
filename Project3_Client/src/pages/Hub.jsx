import { Link } from "react-router-dom";
import "../styles/Hub.css";

export default function Hub() {
  return (
    <div className="home-grid">
        <Link to="/weather"><button>Weather</button></Link>
        <Link to="/cashier"><button>Cashier</button></Link>
        <Link to="/manager"><button>Manager</button></Link>
        <Link to="/menu"><button>Menu</button></Link>
        <Link to="/kitchen"><button>Kitchen</button></Link>
    </div>
    );
}