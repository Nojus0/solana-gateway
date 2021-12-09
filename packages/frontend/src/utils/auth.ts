import { useNavigate } from "solid-app-router";
import { createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { createUserVars, createUser } from "../graphql/createUser";
import { currentUser } from "../graphql/currentUser";
import { login } from "../graphql/login";
import { setFast } from "../graphql/setFast";
import { setPublicKey } from "../graphql/setPublicKey";
import { setWebhook } from "../graphql/setWebhook";

export const useAuth = (forwardTo?: string) => {
  const navigate = useNavigate();

  if (!auth.loggedIn && !auth.loading) {
    return navigate("/login");
  }

  if (auth.loggedIn && !auth.loading && forwardTo) {
    return navigate(forwardTo);
  }
};

export const [auth, setAuth] = createStore({
  loading: true,
  loggedIn: false,
  currentUser: {} as currentUser,
  async login(email: string, password: string, remember: boolean) {
    const resp = await login({ password, email, remember });
    if (resp.errors || !resp.login.api_key) {
      this.invalidAttempt();
    }

    this.setCurrent(resp.login);
    return resp;
  },
  async setWebhook(newUrl: string) {
    if (this.currentUser.webhook == newUrl) {
      return;
    }

    const resp = await setWebhook({ newUrl });
    if (!resp.errors && resp.setWebhook.length) {
      setAuth("currentUser", "webhook", resp.setWebhook);
    }
  },
  async setFast(newFast: boolean) {
    if (this.currentUser.isFast == newFast) {
      return;
    }

    const resp = await setFast({ newFast });

    if (!resp.errors) {
      setAuth("currentUser", "isFast", newFast);
    }
  },
  async setPublicKey(newPublicKey: string) {
    if (this.currentUser.publicKey == newPublicKey) {
      return;
    }

    const resp = await setPublicKey({ newPublicKey });

    if (!resp.errors && resp.setPublicKey) {
      setAuth("currentUser", "publicKey", resp.setPublicKey);
    }
  },
  async fetchUser() {
    const resp = await currentUser();

    if (!resp.errors && resp.currentUser.api_key) {
      this.setCurrent(resp.currentUser);
    } else {
      this.invalidAttempt();
    }
  },

  async register(email: string, password: string) {
    const resp = await createUser({
      email,
      password,
      network: import.meta.env.VITE_NETWORK as string,
    });

    if (resp.errors || !resp.createUser.api_key) {
      this.invalidAttempt();
    }

    this.setCurrent(resp.createUser);

    return resp;
  },
  setCurrent(u: currentUser) {
    setAuth("currentUser", u);
    this.validAttempt();
  },
  validAttempt() {
    setAuth("loading", false);
    setAuth("loggedIn", true);
  },
  invalidAttempt() {
    setAuth("loading", false);
    setAuth("loggedIn", false);
  },
});
