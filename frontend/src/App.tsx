import { useQuery } from "@tanstack/react-query"
import { fetchApi } from "./lib/fetchApi"
import { Outlet } from "react-router"
import { useAuth } from "@clerk/react";
import Header from "./components/Header";
import { useDispatch } from "react-redux";
import { login } from "./store/slices/authSlice";
import Footer from "./components/Footer";
import Loader from "./components/Loader";

function App() {
  const { isLoaded,isSignedIn, getToken } = useAuth();
  const dispatch = useDispatch();

  const { data: response } = useQuery({
    queryKey: ['loggedInUser'],
    queryFn: () => fetchApi('/me', { getToken }),
    enabled: isSignedIn
  })

  if (response) {
    dispatch(login(response.data))
    console.log(response.data)
  }

  if(!isLoaded) return <Loader />

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
