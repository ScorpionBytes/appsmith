import { useHandleDeleteClick } from "PluginActionEditor/hooks";
import React, { useCallback, useState } from "react";
import {
  CONFIRM_CONTEXT_DELETE,
  CONTEXT_DELETE,
  createMessage,
} from "ee/constants/messages";
import { MenuItem } from "@appsmith/ads";

export const Delete = () => {
  const { handleDeleteClick } = useHandleDeleteClick();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSelect = useCallback(
    (e?: Event) => {
      e?.preventDefault();
      confirmDelete ? handleDeleteClick({}) : setConfirmDelete(true);
    },
    [confirmDelete, handleDeleteClick],
  );

  const menuLabel = confirmDelete
    ? createMessage(CONFIRM_CONTEXT_DELETE)
    : createMessage(CONTEXT_DELETE);

  return (
    <MenuItem
      className="t--apiFormDeleteBtn error-menuitem"
      onSelect={handleSelect}
      startIcon="trash"
    >
      {menuLabel}
    </MenuItem>
  );
};
