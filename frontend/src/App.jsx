import {
BrowserRouter,
Routes,
Route
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Analytics from "./pages/Analytics";
import Forecast from "./pages/Forecast";
import Anomalies from "./pages/Anomalies";
import Insights from "./pages/Insights";
import Profile from "./pages/Profile";
import Assistant from "./pages/Assistant";

import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";

export default function App(){

    const Page=(Component)=>(
        <ProtectedRoute>
            <MainLayout>
                <Component/>
            </MainLayout>
        </ProtectedRoute>
    );

    return(
        <BrowserRouter>

            <Routes>

                <Route path="/login" element={<Login/>}/>
                <Route path="/signup" element={<Signup/>}/>

                <Route path="/" element={Page(Dashboard)}/>
                <Route path="/expenses" element={Page(Expenses)}/>
                <Route path="/analytics" element={Page(Analytics)}/>
                <Route path="/forecast" element={Page(Forecast)}/>
                <Route path="/anomalies" element={Page(Anomalies)}/>
                <Route path="/insights" element={Page(Insights)}/>
                <Route path="/profile" element={Page(Profile)}/>
                <Route path="/assistant" element={Page(Assistant)}/>

            </Routes>

        </BrowserRouter>
    )
}