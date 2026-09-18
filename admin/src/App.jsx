import React from 'react'
import Router from "./routes/Router";
import CustomFavIcon from "./assets/favicon1.ico";

const App = () => {
  React.useEffect(() => {
    let link = document.querySelector("link[rel~='icon']")
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link)
    }
    link.href = CustomFavIcon;
  }, []);

  return <Router />
}

export default App