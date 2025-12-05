import { proxy } from "valtio";

export interface ImageData {
  src: string;
  alt?: string;
  caption?: string;
  width?: string;
  alignment?: "left" | "center" | "right";
  pos?: number | undefined;
  nodeType?: any;
}

export interface VideoData {
  src: string;
  title?: string;
  width?: string;
  alignment?: "left" | "center" | "right";
  pos?: number | undefined;
}

export interface CommandMenuData {
  position: { top: number; left: number };
  insertPos?: number;
}

export interface EditorDialogState {
  imageDialog: {
    open: boolean;
    data: ImageData | null;
  };
  videoDialog: {
    open: boolean;
    data: VideoData | null;
  };
  commandMenu: {
    open: boolean;
    data: CommandMenuData | null;
  };
}

export const editorDialogState = proxy<EditorDialogState>({
  imageDialog: {
    open: false,
    data: null,
  },
  videoDialog: {
    open: false,
    data: null,
  },
  commandMenu: {
    open: false,
    data: null,
  },
});

export const editorDialogActions = {
  openImageDialog: (data: ImageData) => {
    editorDialogState.imageDialog = { open: true, data };
  },
  closeImageDialog: () => {
    editorDialogState.imageDialog = { open: false, data: null };
  },
  openVideoDialog: (data: VideoData) => {
    editorDialogState.videoDialog = { open: true, data };
  },
  closeVideoDialog: () => {
    editorDialogState.videoDialog = { open: false, data: null };
  },
  openCommandMenu: (data: CommandMenuData) => {
    editorDialogState.commandMenu = { open: true, data };
  },
  closeCommandMenu: () => {
    editorDialogState.commandMenu = { open: false, data: null };
  },
};
