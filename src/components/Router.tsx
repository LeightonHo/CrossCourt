import { useSelector } from "react-redux";
import { HashRouter, Redirect, Route, Switch } from "react-router-dom";
import { RootState } from "../redux/Store";
import Home from "./Home";
import Login from "../features/login/Login";
import NotFound from "./NotFound";
import PrivacyPolicy from "./PrivacyPolicy";

const Router = () => {
    const { user } = useSelector((state: RootState) => state.general);

    const isLoggedIn = () => {
		return user?.userId?.length > 0;
	}

    return (
        <HashRouter>
            <Switch>
                <Route exact path="/login">
                    <Login />
                </Route>
                <Route path="/privacy">
                    <PrivacyPolicy />
                </Route>
                <Route path="/404">
                    <NotFound />
                </Route>
                <Route exact path={["/lobby", "/games", "/scoreboard", "/profile"]}>
                    {
                        isLoggedIn()
                        ? <Home />
                        : <Redirect to="/login" />
                    }
                </Route>
                <Route path ="/*">
                    { 
                        isLoggedIn()
                        ? <Redirect to="/lobby" /> 
                        : <Redirect to="/login" /> 
                    }
                </Route>
            </Switch>
        </HashRouter>
    );
}

export default Router;