import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // wait for DOM render
    const timeout = setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "auto", // more reliable than smooth
      });
    }, 0);

    return () => clearTimeout(timeout);
  }, [pathname]);
}