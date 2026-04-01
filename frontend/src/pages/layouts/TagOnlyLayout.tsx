import React from "react";
import { Outlet } from "react-router-dom";

const TagOnlyLayout: React.FC = () => {
  return (
    <main className="main-column">
      <Outlet />
    </main>
  )
}

export default TagOnlyLayout;
