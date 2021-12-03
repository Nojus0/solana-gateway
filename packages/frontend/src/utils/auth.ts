import { useNavigate } from "solid-app-router";
import { createStore } from "solid-js/store";
import { createUserVars, createUser } from "../graphql/createUser";
import { currentUser } from "../graphql/currentUser";
import { login } from "../graphql/login";
import { setPublicKey } from "../graphql/setPublicKey";
import { setWebhook } from "../graphql/setWebhook";

export const useAuth = () => {
  const navigate = useNavigate();

  if (!auth.loggedIn && !auth.loading) {
    navigate("/login");
  }
};

export const useIfAuthTransactions = () => {
  const navigate = useNavigate();

  if (auth.loggedIn && !auth.loading) {
    navigate("/transactions");
  }
};

export const [auth, setAuth] = createStore({
  loading: true,
  loggedIn: false,
  currentUser: {
    api_key: "None",
    email: "None",
    isFast: false,
    lamports_recieved: 0,
    publicKey: "None",
    secret: "None",
    webhook: "None",
  } as currentUser,
  async login(email: string, password: string) {
    const resp = await login({ password, email });
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
