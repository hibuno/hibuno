import { DragHandle as DragHandleReact } from "@tiptap/extension-drag-handle-react";
import { GripVertical } from "lucide-react";

export default function DragHandle({ children, ...props }: any) {
 return (
  <DragHandleReact
   {...props}
   onNodeChange={({ node, editor, pos }) => {
    // Optional: Handle node change for highlighting
    console.log("Node changed:", node?.type?.name);
   }}
   computePositionConfig={{
    placement: "left-start",
    strategy: "absolute",
   }}
  >
   <div className="drag-handle flex items-center justify-center w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded cursor-grab active:cursor-grabbing transition-colors">
    <GripVertical size={14} className="text-gray-500" />
   </div>
  </DragHandleReact>
 );
}
