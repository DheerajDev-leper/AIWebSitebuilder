import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { serverUrl } from "../config";
import { setUserData } from "../redux/userSlice";

// Fetches the logged-in user once on app start. Returns `loading` so routes can wait.
function useCurrentUser() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const { data } = await axios.get(`${serverUrl}/api/user/me`, {
          withCredentials: true,
          signal: controller.signal,
        });
        dispatch(setUserData(data));
      } catch (err) {
        if (!axios.isCancel(err)) dispatch(setUserData(null));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [dispatch]);

  return loading;
}

export default useCurrentUser;