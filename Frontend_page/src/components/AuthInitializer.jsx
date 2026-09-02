import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { ENV } from "@/config/env";
import { setCredentials, setAuthLoading } from "@/app/store/authSlice";

export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state) => state.auth);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      // If access token is already present in Redux, no initialization refresh needed
      if (accessToken) {
        setIsInitializing(false);
        return;
      }

      dispatch(setAuthLoading(true));

      try {
        const response = await axios.post(
          `${ENV.API_BASE_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const resData = response.data?.data || response.data;
        const newAccessToken = resData?.access_token || resData?.token;
        const userObj = resData?.user;

        if (isMounted && newAccessToken) {
          dispatch(
            setCredentials({
              user: userObj,
              token: newAccessToken,
              role: userObj?.role,
            })
          );
        }
      } catch (err) {
        // Silent catch: user has no valid refresh cookie (unauthenticated visitor)
      } finally {
        if (isMounted) {
          dispatch(setAuthLoading(false));
          setIsInitializing(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return <>{children}</>;
}
