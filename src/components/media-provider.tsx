"use client";

import React, { createContext, useContext } from "react";
import { MediaDialog, useMediaDialog } from "@/components/media-dialog";

interface MediaContextType {
  openDialog: (data: {
    src: string;
    alt?: string | undefined;
    type: "image" | "video";
    caption?: string | undefined;
  }) => void;
}

const MediaContext = createContext<MediaContextType | null>(null);

export function useMediaContext() {
  const context = useContext(MediaContext);
  if (!context) {
    // Return a no-op function if no provider is found
    return {
      openDialog: () => {}
    };
  }
  return context;
}

interface MediaProviderProps {
  children: React.ReactNode;
}

export function MediaProvider({ children }: MediaProviderProps) {
  const { isOpen, mediaData, openDialog, closeDialog } = useMediaDialog();

  return (
    <MediaContext.Provider value={{ openDialog }}>
      {children}
      {mediaData && (
        <MediaDialog
          isOpen={isOpen}
          onClose={closeDialog}
          src={mediaData.src}
          type={mediaData.type}
          {...(mediaData.alt && { alt: mediaData.alt })}
          {...(mediaData.caption && { caption: mediaData.caption })}
        />
      )}
    </MediaContext.Provider>
  );
}