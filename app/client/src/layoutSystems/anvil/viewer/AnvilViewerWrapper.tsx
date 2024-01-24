import React, { useMemo } from "react";
import type { WidgetProps } from "widgets/BaseWidget";
import { AnvilViewerDetachedWidgetOnion } from "./AnvilViewerDetachedWidgetOnion";
import { AnvilViewerWidgetOnion } from "./AnvilViewerWidgetOnion";

/**
 * AnvilViewerWrapper
 *
 * Component that wraps a BaseWidget implementation of a widget with viewer(Deployed Application Viewer) specific layers of Anvil Layout System.
 * check out AnvilViewerWidgetOnion and AnvilViewerModalOnion to further understand what they implement under the hood.
 *
 * @param props
 * @returns Enhanced BaseWidget with Viewer specific Layers.
 */
export const AnvilViewerWrapper = (props: WidgetProps) => {
  const WidgetOnion = useMemo(() => {
    return props.detachFromLayout === true
      ? AnvilViewerDetachedWidgetOnion
      : AnvilViewerWidgetOnion;
  }, [props.type]);

  return <WidgetOnion {...props}>{props.children}</WidgetOnion>;
};
