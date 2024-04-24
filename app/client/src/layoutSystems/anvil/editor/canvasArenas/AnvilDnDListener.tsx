import type { Ref, RefObject } from "react";
import React, { forwardRef } from "react";
import styled from "styled-components";

interface AnvilDnDListenerProps {
  compensatorValues: {
    left: number;
    top: number;
  };
  ref: RefObject<HTMLDivElement>; // Ref object for the div element
  zIndex: number; // Z-index of the listener
}

// Styled component for the DnD listener
const StyledDnDListener = styled.div<{
  paddingLeft: number;
  paddingTop: number;
  zIndex: number;
}>`
  position: absolute;
  pointer-events: all;
  top: ${(props) => -props.paddingTop}px;
  left: ${(props) => -props.paddingLeft}px;
  height: calc(100% + ${(props) => 2 * props.paddingTop}px);
  width: calc(100% + ${(props) => 2 * props.paddingLeft}px);
  padding-inline: ${(props) => props.paddingLeft}px;
  padding-block: ${(props) => props.paddingTop}px;
  z-index: ${(props) => props.zIndex};
`;

export const AnvilDnDListener = forwardRef(
  (props: AnvilDnDListenerProps, ref: Ref<HTMLDivElement>) => {
    const { compensatorValues, zIndex } = props;

    return (
      <StyledDnDListener
        data-type={"anvil-dnd-listener"}
        paddingLeft={compensatorValues.left}
        paddingTop={compensatorValues.top}
        ref={ref}
        zIndex={zIndex}
      />
    );
  },
);