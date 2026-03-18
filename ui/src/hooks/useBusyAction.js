import { useState } from "react";

export function useBusyAction() {
  const [busy, setBusy] = useState(false);

  const withBusy = async (action) => {
    setBusy(true);
    try {
      return await action();
    } finally {
      setBusy(false);
    }
  };

  return { busy, withBusy };
}
