import { Route,Routes } from "react-router-dom";
import { useEffect } from "react";

// import { checkAuth } from "../store/reducers/authentication";

// route

//page
import GamePage from "./GamePage/GamePage";

const App = ()=>{
  return (
    <Routes>
      <Route path="/battle" element={<GamePage/>}/>
    </Routes>
  )
}

export default App;