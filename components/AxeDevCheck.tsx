"use client";

import { useEffect } from "react";
import React from "react";
import ReactDOM from "react-dom";

export function AxeDevCheck() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      import("@axe-core/react").then((axe) => {
        axe.default(React, ReactDOM, 1000);
      });
    }
  }, []);

  return null;
}
