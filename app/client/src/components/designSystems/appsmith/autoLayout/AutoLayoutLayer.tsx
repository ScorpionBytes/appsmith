import React, { ReactNode } from "react";
import styled from "styled-components";

import { FlexDirection, LayoutDirection } from "components/constants";
import { DRAG_MARGIN } from "widgets/constants";

/**
 * 1. Given a direction if should employ flex in perpendicular direction.
 * 2. It should be able to render children within three nested wrappers for start, center and end alignment.
 * 3. Only render start wrapper if a fill widget is present.
 */

export interface AutoLayoutLayerProps {
  start?: ReactNode;
  center?: ReactNode;
  end?: ReactNode;
  direction: LayoutDirection;
  hasFillChild?: boolean;
  index: number;
  widgetId: string;
  isMobile?: boolean;
}

const LayoutLayerContainer = styled.div<{
  flexDirection: FlexDirection;
}>`
  display: flex;
  flex-direction: ${({ flexDirection }) => flexDirection || FlexDirection.Row};
  justify-content: flex-start;
  align-items: flex-start;

  width: 100%;
  height: auto;
  margin-top: ${DRAG_MARGIN}px;
`;

const SubWrapper = styled.div<{
  flexDirection: FlexDirection;
  wrap?: boolean;
}>`
  flex: 1 1 33.3%;
  display: flex;
  flex-direction: ${({ flexDirection }) => flexDirection || "row"};
  align-items: "flex-start";
  flex-wrap: ${({ wrap }) => (wrap ? "wrap" : "nowrap")};
`;

const StartWrapper = styled(SubWrapper)`
  justify-content: flex-start;
`;

const EndWrapper = styled(SubWrapper)`
  justify-content: flex-end;
`;

const CenterWrapper = styled(SubWrapper)`
  justify-content: center;
`;

function getFlexDirection(direction: LayoutDirection): FlexDirection {
  return direction === LayoutDirection.Horizontal
    ? FlexDirection.Row
    : FlexDirection.Column;
}

function getInverseDirection(direction: LayoutDirection): LayoutDirection {
  return direction === LayoutDirection.Horizontal
    ? LayoutDirection.Vertical
    : LayoutDirection.Horizontal;
}

function AutoLayoutLayer(props: AutoLayoutLayerProps) {
  const flexDirection = getFlexDirection(getInverseDirection(props.direction));
  return (
    <LayoutLayerContainer
      className={`auto-layout-layer-${props.widgetId}-${props.index}`}
      flexDirection={flexDirection}
    >
      <StartWrapper
        flexDirection={flexDirection}
        wrap={props.hasFillChild && props.isMobile}
      >
        {props.start}
      </StartWrapper>
      <CenterWrapper
        className={props.hasFillChild ? "no-display" : ""}
        flexDirection={flexDirection}
      >
        {props.center}
      </CenterWrapper>
      <EndWrapper
        className={props.hasFillChild ? "no-display" : ""}
        flexDirection={flexDirection}
      >
        {props.end}
      </EndWrapper>
    </LayoutLayerContainer>
  );
}

export default AutoLayoutLayer;
