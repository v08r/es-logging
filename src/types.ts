import type {
    AlertCode,
    Code,
    CriticalCode,
    DebugCode,
    EmergencyCode,
    ErrorCode,
    InfoCode,
    NoticeCode,
    WarningCode,
} from './codes';
import type { Severity } from './constants';
import type Entry from './Entry';

type AllowedCode<S extends Severity, C extends Code> = AllowedSeverity<C, SeverityFromCode<C>, S>;

type AllowedSeverity<
    C extends Code,
    S extends Severity,
    T extends Severity
> = S extends Severity.Emergency
    ? C
    : T extends Severity.Alert
    ? S extends Severity.Emergency | Severity.Alert
        ? C
        : never
    : T extends Severity.Critical
    ? S extends Severity.Emergency | Severity.Alert | Severity.Critical
        ? C
        : never
    : T extends Severity.Error
    ? S extends Severity.Emergency | Severity.Alert | Severity.Critical | Severity.Error
        ? C
        : never
    : T extends Severity.Warning
    ? S extends
          | Severity.Emergency
          | Severity.Alert
          | Severity.Critical
          | Severity.Error
          | Severity.Warning
        ? C
        : never
    : T extends Severity.Notice
    ? S extends
          | Severity.Emergency
          | Severity.Alert
          | Severity.Critical
          | Severity.Error
          | Severity.Warning
          | Severity.Notice
        ? C
        : never
    : T extends Severity.Info
    ? S extends
          | Severity.Emergency
          | Severity.Alert
          | Severity.Critical
          | Severity.Error
          | Severity.Warning
          | Severity.Notice
          | Severity.Info
        ? C
        : never
    : C;

interface Constructor<T = {}> {
    new (...args: any[]): T;
}

type EntryDefinitions<C extends Code> = Record<C, { message: string; payload: any }>;

type KnownEntry<
    PID extends string,
    PV extends number,
    C extends Code,
    ED extends Record<
        C,
        {
            message: string;
            payload: any;
        }
    >
> =
    | ProductEntry<PID, PV, C, ED>
    | ProductEntry<
          PID,
          PV,
          LoggerReservedEntryCode,
          {
              300998: {
                  message: `logger level has been decreased from ${Exclude<
                      SeverityLabel,
                      'Debug'
                  >} to ${Exclude<SeverityLabel, 'Off'>}`;
                  payload: { from: Exclude<Severity, Severity.Debug> | null; to: Severity };
              };
              300999: {
                  message: 'logger has been attached';
                  payload: null;
              };
              400998: {
                  message: `logger level has been increased from ${Exclude<
                      SeverityLabel,
                      'Off'
                  >} to ${Exclude<SeverityLabel, 'Debug'>}`;
                  payload: { from: Severity; to: Exclude<Severity, Severity.Debug> | null };
              };
              400999: {
                  message: 'logger has been detached';
                  payload: null;
              };
          }
      >;

interface Logger<E extends Entry<number, string, number, Code, string, unknown>> {
    log(entry: E): void;
}

type LoggerReservedEntryCode = 300998 | 300999 | 400998 | 400999;

interface LoggerWithSeverity<C extends Code, ED extends EntryDefinitions<C>, S extends Severity> {
    <EC extends AllowedCode<S, C>>(
        code: EC,
        message: ED[EC]['message'],
        payload: ED[EC]['payload']
    ): void;
}

type MaybeReadonly<T> = T | Readonly<T>;

type ProductEntry<
    PID extends string,
    PV extends number,
    C extends Code,
    ED extends Record<
        C,
        {
            message: string;
            payload: any;
        }
    >
> = Value<{
    [k in Extract<keyof ED, Code>]: Entry<number, PID, PV, C, ED[k]['message'], ED[k]['payload']>;
}>;

type SeverityFromCode<C extends Code> = C extends DebugCode
    ? Severity.Debug
    : C extends InfoCode
    ? Severity.Info
    : C extends NoticeCode
    ? Severity.Notice
    : C extends WarningCode
    ? Severity.Warning
    : C extends ErrorCode
    ? Severity.Error
    : C extends CriticalCode
    ? Severity.Critical
    : C extends AlertCode
    ? Severity.Alert
    : C extends EmergencyCode
    ? Severity.Emergency
    : Severity;

type SeverityLabel = keyof typeof Severity | 'Off';

type Value<T> = T[keyof T];

export type {
    AllowedCode,
    Code,
    Constructor,
    EntryDefinitions,
    KnownEntry,
    Logger,
    LoggerReservedEntryCode,
    LoggerWithSeverity,
    MaybeReadonly,
    SeverityFromCode,
    SeverityLabel,
};
