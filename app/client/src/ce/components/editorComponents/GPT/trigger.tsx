import type { TEditorModes } from "components/editorComponents/CodeEditor/EditorConfig";
import type { FeatureFlags } from "@appsmith/entities/FeatureFlag";
export const APPSMITH_AI = "AI";

/* eslint-disable-next-line */
export function isAIEnabled(ff: FeatureFlags, mode: TEditorModes) {
  return false;
}
