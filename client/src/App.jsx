import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import GetCurrentUser from './hooks/GetCurrentUser'
import { useSelector } from 'react-redux'
import Dashboard from './pages/Dashboard'
import Generate from './pages/Generate'
import WebsiteEditor from './pages/WebsiteEditor'
import LiveSite from './pages/LiveSite'
import Pricing from './pages/Pricing'


export const serverUrl = "http://localhost:8000"
function App() {
  GetCurrentUser()
  const {userData} = useSelector(state=>state.user)
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path='/dashboard' element={userData?<Dashboard />:<Home />} />
          <Route path='/generate' element={userData?<Generate />:<Home />} />
          <Route path='/editor/:id' element={userData?<WebsiteEditor />:<Home />} />
          <Route path="/site/:id" element={<LiveSite />} />
          <Route path="/pricing" element={<Pricing />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App