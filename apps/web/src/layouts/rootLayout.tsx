import { useEffect, useRef, useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../features/auth/authContext";
import type { TaskDto } from "@todo/contracts";

export type AppShellOutletContext = {
  selectedTask: TaskDto | null;
  setSelectedTask: React.Dispatch<React.SetStateAction<TaskDto | null>>;
};

function pxToRem(px: number) {
  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize
  );
  return px / rootFontSize;
}


export default function AppShellLayout() {
  const [leftWidth, setLeftWidth] = useState(280);
  const [rightWidth, setRightWidth] = useState(360);
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);

  const { logout } = useAuth();

  const draggingRef = useRef<null | "left" | "right">(null);

  const rightOpen = !!selectedTask;

  // 🧠 Drag logic (still px-based)
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (draggingRef.current === "left") {
        setLeftWidth(Math.max(200, Math.min(500, e.clientX)));
      }

      if (draggingRef.current === "right") {
        const next = window.innerWidth - e.clientX;
        setRightWidth(Math.max(280, Math.min(600, next)));
      }
    }

    function onMouseUp() {
      draggingRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  function startDragging(side: "left" | "right") {
    draggingRef.current = side;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  const templateColumns = `
    ${pxToRem(leftWidth)}rem 
    0.375rem 
    1fr 
    0.375rem 
    ${rightOpen ? `${pxToRem(rightWidth)}rem` : "0rem"}
  `;

  return(
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="grid h-screen overflow-hidden bg-base-100"
      style={{ gridTemplateColumns: templateColumns }}
    >
      {/* LEFT PANEL */}
      <aside className="min-w-0 overflow-hidden border-base-300 bg-base-100 p-4">
        <div className="flex flex-col">
              <Link to="/" className="my-1.5">Home</Link>
              <Link to="/the-day" className="my-1.5">The Day</Link>
              <Link to="/profile" className="my-1.5">Profile</Link>
              <button className="btn btn-primary" onClick={logout}>
                Logout
              </button>
              <div className="divider my-1.5 "></div>
            </div>
      </aside>

      {/* LEFT RESIZER */}
      <div
        className="cursor-col-resize border-none box-shadow-xl hover:bg-primary transition-colors"
        onMouseDown={() => startDragging("left")}
      />

      {/* MAIN PANEL */}
      <motion.main className="min-w-0 overflow-auto bg-base-300 p-6" layout="position" transition={{ type: "spring", stiffness: 320, damping: 32 }} >
        <Outlet context={{ selectedTask, setSelectedTask } satisfies AppShellOutletContext}  />
      </motion.main>

      {/* RIGHT RESIZER */}
      <motion.div
        className={`cursor-col-resize transition-colors ${
          rightOpen ? "bg-base-300 hover:bg-primary" : "bg-transparent"
        }`}
        onMouseDown={() => {
          if (rightOpen) startDragging("right");
        }}
        layout
        transition={{ duration: 0.25 }}
      />

      {/* RIGHT PANEL */}
      <motion.aside
        layout
        className="min-w-0 overflow-hidden border-l border-base-300 bg-base-200"
        transition={{ duration: 0.25 }}
      >
        <AnimatePresence mode="wait">
          {rightOpen && selectedTask && (
            <motion.div
              key={selectedTask.id}
              initial={{ x: "2rem", opacity: 0 }}
              animate={{ x: "0rem", opacity: 1 }}
              exit={{ x: "2rem", opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col h-full p-4"
            >
              <div className="mb-4 flex justify-between">
                <h2 className="text-xl font-semibold">{selectedTask.title}</h2>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setSelectedTask(null)}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-md font-semibold text-base-content/70">
                  {selectedTask.description}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </motion.div>
  );
}