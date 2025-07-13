import { Temporal } from "@js-temporal/polyfill";

const typeFnMap = {
  "ISO 8601": "from",
  EpochSeconds: "fromEpochSeconds",
  EpochMilliseconds: "fromEpochMilliseconds",
  EpochMicroseconds: "fromEpochMicroseconds",
  EpochNanoseconds: "fromEpochNanoseconds",
};

export default async (input, options) => {
  const time = Temporal.Instant[typeFnMap[options.type]](input);
  return `zonedDateTimeISO: ${time.toZonedDateTimeISO(options.timeZone)}
epochSeconds: ${time.epochSeconds}
epochMilliseconds: ${time.epochMilliseconds}
epochMicroseconds: ${time.epochMicroseconds}
epochNanoseconds: ${time.epochNanoseconds}`;
};
