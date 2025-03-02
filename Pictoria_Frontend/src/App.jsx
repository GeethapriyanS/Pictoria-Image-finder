import {BrowserRouter,Routes,Route} from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
function App() {
  return (
    <>
     <BrowserRouter>
       <Routes>
         <Route path='home' element={<Home />}></Route>
         <Route path='login' element={<Login />}/><Route/>
         <Route path='signup' element={<Signup />}/><Route/>
       </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
