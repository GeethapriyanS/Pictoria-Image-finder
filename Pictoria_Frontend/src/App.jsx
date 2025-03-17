import {BrowserRouter,Routes,Route} from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Home1 from './components/Home1';
function App() {
  return (
    <>
     <BrowserRouter>
       <Routes>
         <Route path='home' element={<Home />}/>
         <Route path='login' element={<Login />}/>
         <Route path='signup' element={<Signup />}/>
         <Route path='home1' element={<Home1/>}/>
       </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
