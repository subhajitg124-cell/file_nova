import { memo, useEffect } from "react";
import { useLocation } from "wouter";

export const ScrollToTop = memo(function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
});
