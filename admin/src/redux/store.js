import { createStore, combineReducers } from "redux";
import { initialUsers } from "../data/users";
import { initialProducts, initialSchemes, initialArticles } from "../data/content";
import { initialDistrictMappings } from "../data/masterData";
import { initialProfileInfo } from "../data/profile";

// ---- LocalStorage helpers (keep it simple, no middleware) ----
const loadFromStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const loadAuth = () =>
  loadFromStorage("seltiger_auth", { isAuthenticated: false, currentUser: null });

// ---- Action types ----
export const ADD_USER = "ADD_USER";
export const UPDATE_USER = "UPDATE_USER";
export const DELETE_USER = "DELETE_USER";

export const ADD_PRODUCT = "ADD_PRODUCT";
export const UPDATE_PRODUCT = "UPDATE_PRODUCT";
export const DELETE_PRODUCT = "DELETE_PRODUCT";
export const DELETE_PRODUCTS = "DELETE_PRODUCTS";

export const ADD_SCHEME = "ADD_SCHEME";
export const UPDATE_SCHEME = "UPDATE_SCHEME";
export const DELETE_SCHEME = "DELETE_SCHEME";

export const ADD_ARTICLE = "ADD_ARTICLE";
export const UPDATE_ARTICLE = "UPDATE_ARTICLE";
export const DELETE_ARTICLE = "DELETE_ARTICLE";

export const ADD_MAPPING = "ADD_MAPPING";
export const UPDATE_MAPPING = "UPDATE_MAPPING";
export const DELETE_MAPPING = "DELETE_MAPPING";

export const UPDATE_PROFILE = "UPDATE_PROFILE";
export const CHANGE_PIN = "CHANGE_PIN";

export const LOGIN = "LOGIN";
export const LOGOUT = "LOGOUT";

// ---- Action creators ----
export const addUser = (user) => ({ type: ADD_USER, payload: user });
export const updateUser = (user) => ({ type: UPDATE_USER, payload: user });
export const deleteUser = (id) => ({ type: DELETE_USER, payload: id });

export const addProduct = (product) => ({ type: ADD_PRODUCT, payload: product });
export const updateProduct = (product) => ({ type: UPDATE_PRODUCT, payload: product });
export const deleteProduct = (id) => ({ type: DELETE_PRODUCT, payload: id });
export const deleteProducts = (ids) => ({ type: DELETE_PRODUCTS, payload: ids });

export const addScheme = (scheme) => ({ type: ADD_SCHEME, payload: scheme });
export const updateScheme = (scheme) => ({ type: UPDATE_SCHEME, payload: scheme });
export const deleteScheme = (id) => ({ type: DELETE_SCHEME, payload: id });

export const addArticle = (article) => ({ type: ADD_ARTICLE, payload: article });
export const updateArticle = (article) => ({ type: UPDATE_ARTICLE, payload: article });
export const deleteArticle = (id) => ({ type: DELETE_ARTICLE, payload: id });

export const addMapping = (mapping) => ({ type: ADD_MAPPING, payload: mapping });
export const updateMapping = (mapping) => ({ type: UPDATE_MAPPING, payload: mapping });
export const deleteMapping = (id) => ({ type: DELETE_MAPPING, payload: id });

export const updateProfile = (fields) => ({ type: UPDATE_PROFILE, payload: fields });
export const changePin = (newPin) => ({ type: CHANGE_PIN, payload: newPin });

export const login = (userId) => ({ type: LOGIN, payload: userId });
export const logout = () => ({ type: LOGOUT });

// ---- Generic list reducer factory (add/update/delete by id, persisted) ----
function createListReducer({ storageKey, initial, addType, updateType, deleteType, deleteManyType }) {
  return (state = loadFromStorage(storageKey, initial), action) => {
    switch (action.type) {
      case addType: {
        const nextState = [action.payload, ...state];
        localStorage.setItem(storageKey, JSON.stringify(nextState));
        return nextState;
      }
      case updateType: {
        const nextState = state.map((item) =>
          item.id === action.payload.id ? { ...item, ...action.payload } : item
        );
        localStorage.setItem(storageKey, JSON.stringify(nextState));
        return nextState;
      }
      case deleteType: {
        const nextState = state.filter((item) => item.id !== action.payload);
        localStorage.setItem(storageKey, JSON.stringify(nextState));
        return nextState;
      }
      case deleteManyType: {
        const idSet = new Set(action.payload);
        const nextState = state.filter((item) => !idSet.has(item.id));
        localStorage.setItem(storageKey, JSON.stringify(nextState));
        return nextState;
      }
      default:
        return state;
    }
  };
}

const usersReducer = createListReducer({
  storageKey: "seltiger_users",
  initial: initialUsers,
  addType: ADD_USER,
  updateType: UPDATE_USER,
  deleteType: DELETE_USER,
});

const productsReducer = createListReducer({
  storageKey: "seltiger_products",
  initial: initialProducts,
  addType: ADD_PRODUCT,
  updateType: UPDATE_PRODUCT,
  deleteType: DELETE_PRODUCT,
  deleteManyType: DELETE_PRODUCTS,
});

const schemesReducer = createListReducer({
  storageKey: "seltiger_schemes",
  initial: initialSchemes,
  addType: ADD_SCHEME,
  updateType: UPDATE_SCHEME,
  deleteType: DELETE_SCHEME,
});

const articlesReducer = createListReducer({
  storageKey: "seltiger_articles",
  initial: initialArticles,
  addType: ADD_ARTICLE,
  updateType: UPDATE_ARTICLE,
  deleteType: DELETE_ARTICLE,
});

const districtMappingsReducer = createListReducer({
  storageKey: "seltiger_district_mappings",
  initial: initialDistrictMappings,
  addType: ADD_MAPPING,
  updateType: UPDATE_MAPPING,
  deleteType: DELETE_MAPPING,
});

const loadProfile = () => loadFromStorage("seltiger_profile", initialProfileInfo);

const profileReducer = (state = loadProfile(), action) => {
  switch (action.type) {
    case UPDATE_PROFILE: {
      const nextState = { ...state, ...action.payload };
      localStorage.setItem("seltiger_profile", JSON.stringify(nextState));
      return nextState;
    }
    case CHANGE_PIN: {
      const nextState = { ...state, pin: action.payload, lastPinChanged: "Today" };
      localStorage.setItem("seltiger_profile", JSON.stringify(nextState));
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
  products: productsReducer,
  schemes: schemesReducer,
  articles: articlesReducer,
  districtMappings: districtMappingsReducer,
  profile: profileReducer,
  auth: authReducer,
});

export const store = createStore(rootReducer);
