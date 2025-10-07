import { fontFamily, loadFont } from "@remotion/google-fonts/IBMPlexSans";
import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender } from "remotion";

// Font loading utilities
const loading = loadFont("normal", {
  weights: ["500", "600"],
});

export const FONT_FAMILY = fontFamily;

export const waitForFonts = async () => {
  await loading.waitUntilDone();
};

// Font loading wrapper component
export const WaitForFonts: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [handle] = useState(() => delayRender("<WaitForFonts> component"));

  useEffect(() => {
    return () => {
      continueRender(handle);
    };
  }, [handle]);

  useEffect(() => {
    const delay = delayRender("Waiting for fonts to be loaded");

    waitForFonts()
      .then(() => {
        continueRender(handle);
        continueRender(delay);
        setFontsLoaded(true);
      })
      .catch((err) => {
        cancelRender(err);
      });
  }, [handle]);

  if (!fontsLoaded) {
    return null;
  }

  return <>{children}</>;
};
