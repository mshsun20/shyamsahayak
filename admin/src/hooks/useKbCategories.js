import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import axiosInstance from "../config/axiosInstance";
import { showSnackbar } from "../redux/slices/snackbarSlice";

// Single source of truth for Knowledge Base categories: the Knowledge Category Master.
// status: "Active" (default, for pickers) | "Inactive" | "all" (for filters / listings).
export default function useKbCategories({ status = "Active" } = {}) {
  const [categories, setCategories] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const dispatch = useDispatch();

  const refetch = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/knowledge-bases/categories`, { params: { status } });
      const data = response?.data?.data;
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error.message);
      dispatch(showSnackbar({ message: error.response?.data?.message || error.message, type: "error" }));
    } finally {
      setLoaded(true);
    }
  }, [status, dispatch]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { categories, loaded, refetch };
}
