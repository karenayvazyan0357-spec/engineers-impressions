import Header from './components/layout/Header';
import Hero from './components/hero/Hero';
import Layers from './components/layers/Layers';
import './App.css';
import Cases from './components/cases/Cases';
import Assembly from './components/assembly/Assembly';
import Quality from './components/quality/Quality';
import Contact from './components/contact/Contact';
import Footer from './components/footer/Footer';


function App() {
  return (
    <>
      {/* Skip-link: первый Tab с клавиатуры уводит к содержимому, минуя
          шапку и навигацию. Скрыт, пока не получит фокус (стили — App.css). */}
      <a className="skip-link" href="#main-content">
        Перейти к содержимому
      </a>

      <Header />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <Layers />
        <Cases />
        <Assembly />
        <Quality />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default App;