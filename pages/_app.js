import Footer from "../components/Footer";
import "../styles/theme.css";
import "../styles/login.css";
import "../styles/dashboard.css";
import "../styles/system.css";
import "../styles/footer.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Footer />
    </>
  );
}
