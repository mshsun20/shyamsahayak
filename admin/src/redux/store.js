import { createStore, combineReducers } from "redux";
import { initialUsers } from "../data/users";

// ---- LocalStorage helpers (keep it simple, no middleware) ----
const loadUsers = () => {
  try {
    const saved = localStorage.getItem("seltiger_users");
    return saved ? JSON.parse(saved) : initialUsers;
  } catch {
    return initialUsers;
  }
};

const loadAuth = () => {
  try {
    const saved = localStorage.getItem("seltiger_auth");
    return saved ? JSON.parse(saved) : { isAuthenticated: false, currentUser: null };
  } catch {
    return { isAuthenticated: false, currentUser: null };
  }
};

// ---- Action types ----
export const ADD_USER = "ADD_USER";
export const UPDATE_USER = "UPDATE_USER";
export const DELETE_USER = "DELETE_USER";
export const LOGIN = "LOGIN";
export const LOGOUT = "LOGOUT";

// ---- Action creators ----
export const addUser = (user) => ({ type: ADD_USER, payload: user });
export const updateUser = (user) => ({ type: UPDATE_USER, payload: user });
export const deleteUser = (id) => ({ type: DELETE_USER, payload: id });
export const login = (userId) => ({ type: LOGIN, payload: userId });
export const logout = () => ({ type: LOGOUT });

// ---- Reducers ----
const usersReducer = (state = loadUsers(), action) => {
  switch (action.type) {
    case ADD_USER: {
      const nextState = [...state, action.payload];
      localStorage.setItem("seltiger_users", JSON.stringify(nextState));
      return nextState;
    }
    case UPDATE_USER: {
      const nextState = state.map((u) =>
        u.id === action.payload.id ? { ...u, ...action.payload } : u
      );
      localStorage.setItem("seltiger_users", JSON.stringify(nextState));
      return nextState;
    }
    case DELETE_USER: {
      const nextState = state.filter((u) => u.id !== action.payload);
      localStorage.setItem("seltiger_users", JSON.stringify(nextState));
      return nextState;
    }
    default:
      return state;
  }
};

const authReducer = (state = loadAuth(), action) => {
  switch (action.type) {
    case LOGIN: {
      const nextState = {
        isAuthenticated: true,
        currentUser: { userId: action.payload, name: "Admin User", role: "Super Admin" },
      };
      localStorage.setItem("seltiger_auth", JSON.stringify(nextState));
      return nextState;
    }
    case LOGOUT: {
      const nextState = { isAuthenticated: false, currentUser: null };
      localStorage.setItem("seltiger_auth", JSON.stringify(nextState));
      return nextState;
    }
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  users: usersReducer,
  auth: authReducer,
});

export const store = createStore(rootReducer);
