import React from "react";
import type { Severity } from "entities/AppsmithConsole";
import dayjs from "dayjs";
// import moment from "moment";

// This component is used to render the timestamp in the error logs.
export default function LogTimeStamp(props: {
  timestamp: string;
  severity: Severity;
}) {
  return (
    <div className={`debugger-time ${props.severity}`}>
      {dayjs(parseInt(props.timestamp)).format("HH:mm:ss")}
    </div>
  );
}
