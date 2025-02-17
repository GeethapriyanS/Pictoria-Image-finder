import {BrowserRouter,Routes,Route} from 'react-router-dom';
import Home from './components/Home';
function App() {
  return (
    <>
     <BrowserRouter>
       <Routes>
         <Route path='home' element={<Home />}></Route>
       </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
