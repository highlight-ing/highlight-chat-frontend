import React, { createContext, useContext, useState } from "react";

interface AboutMeContextProps {
  aboutMe: string | undefined;
  setAboutMe: (aboutMe: string | undefined) => void;
}

export const AboutMeContext = createContext<AboutMeContextProps>({
  aboutMe: undefined,
  setAboutMe: () => {},
});

export const AboutMeContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [aboutMe, setAboutMe] = useState<string | undefined>(undefined);

  return (
    <AboutMeContext.Provider value={{ aboutMe, setAboutMe }}>
      {children}
    </AboutMeContext.Provider>
  );
};

export const useAboutMeContext = () => {
  return useContext(AboutMeContext);
};