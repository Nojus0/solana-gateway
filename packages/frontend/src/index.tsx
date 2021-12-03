import { Route, Router, Routes } from "solid-app-router";
import { Component, lazy, onMount, Suspense } from "solid-js";
import { render } from "solid-js/web";
import "./index.css";
import { auth } from "./utils/auth";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Settings = lazy(() => import("./pages/Settings"));
const Transactions = lazy(() => import("./pages/Transactions"));

const App: Component = () => {
  onMount(() => {
    auth.fetchUser();
  });
  return (
    <Suspense>
      <Routes>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/settings" component={Settings} />
        <Route path="/transactions" component={Transactions} />
      </Routes>
    </Suspense>
  );
};

render(
  () => (
    <Router>
      <App />
    </Router>
  ),
  document.getElementById("root") as HTMLElement
);
