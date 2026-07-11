import { Outlet } from "react-router"
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {

  return (
    <div className='min-h-screen flex flex-wrap content-between'>
      <div className='w-full block'>
        <Header />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-6 md:py-10">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default App
