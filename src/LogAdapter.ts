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
import { Severity } from './constants';
import Entry from './Entry';
import type {
    EntryDefinitions,
    KnownEntry,
    Logger,
    LoggerReservedEntryCode,
    LoggerWithSeverity,
} from './types';

type LogMethod<C extends Code, ED extends EntryDefinitions<C>> =
    | (<DC extends C>(code: DC, message: ED[DC]['message'], payload: ED[DC]['payload']) => void)
    | undefined;

const severityValues = Object.values(Severity).reduce((sm, severity) => {
    if (typeof severity === 'number') sm.push([Severity[severity].toLowerCase(), severity]);
    return sm;
}, [] as Array<[string, Severity]>);

const setLog = (logAdapter: any, log: any, threshold: Severity | null) => {
    for (const [key, severity] of severityValues)
        logAdapter[key] = threshold && severity >= threshold ? log : undefined; // eslint-disable-line no-invalid-this
};

const logLevelChange = (
    logAdapter: any,
    previous: Severity | null,
    current: Severity | null,
    increase?: boolean
) => {
    logAdapter[increase ? 'warning' : 'notice']?.(
        increase ? 400998 : 300998,
        `logger level has been ${increase ? 'in' : 'de'}creased from ${
            Severity[previous as Severity] || 'Off'
        } to ${Severity[current as Severity] || 'Off'}`,
        null
    );
};

/** Adapter for loggers. */
class LogAdapter<
    PID extends string,
    PV extends number,
    C extends Exclude<Code, LoggerReservedEntryCode>,
    ED extends EntryDefinitions<C>
> {
    #logger?: Logger<KnownEntry<PID, PV, C, ED>>;
    #log?: LoggerWithSeverity<C, ED, Severity>;
    #severity: Severity | null = null;
    #productID: PID;
    #productVersion: PV;

    /**
     * @param productID ID of the software product associated with log entries.
     * @param productVersion Version of the software product associated
     *                       with log entries.
     */
    constructor(productID: PID, productVersion: PV) {
        this.#productID = productID;
        this.#productVersion = productVersion;
    }

    /**
     * Log method that is only available if severity has been set to:
     * `Severity.Debug` and a logger is attached.
     */
    readonly debug?: LogMethod<Extract<C, DebugCode>, ED>;
    /**
     * Log method that is only available if severity has been set to:
     * `Severity.Info` or lower and a logger is attached.
     */
    readonly info?: LogMethod<Extract<C, InfoCode>, ED>;
    /**
     * Log method that is only available if severity has been set to:
     * `Severity.Notice` or lower and a logger is attached.
     */
    readonly notice?: LogMethod<Extract<C, NoticeCode>, ED>;
    /**
     * Log method that is only available if severity has been set to:
     * `Severity.Warning` or lower and a logger is attached.
     */
    readonly warning?: LogMethod<Extract<C, WarningCode>, ED>;
    /**
     * Log method that is only available if severity has been set to:
     * `Severity.Error` or lower and a logger is attached.
     */
    readonly error?: LogMethod<Extract<C, ErrorCode>, ED>;
    /**
     * Log method that is only available if severity has been set to:
     * `Severity.Critical` or lower and a logger is attached.
     */
    readonly critical?: LogMethod<Extract<C, CriticalCode>, ED>;
    /**
     * Log method that is only available if severity has been set to:
     * `Severity.Alert` or lower and a logger is attached.
     */
    readonly alert?: LogMethod<Extract<C, AlertCode>, ED>;
    /**
     * Log method that is only available if severity has been set to:
     * `Severity.Emergency` or lower and a logger is attached.
     */
    readonly emergency?: LogMethod<Extract<C, EmergencyCode>, ED>;

    /** Currently attached logger. */
    set logger(logger: Logger<KnownEntry<PID, PV, C, ED>> | undefined) {
        if (logger !== this.#logger) {
            this.warning?.(400999 as any, 'logger has been detached', null);

            this.#logger = logger;

            setLog(
                this,
                (this.#log =
                    logger &&
                    ((code: any, message: any, payload: any) => {
                        const timedelta = performance.now();
                        logger.log(
                            new Entry(
                                code,
                                '',
                                message,
                                payload,
                                this.#productID,
                                this.#productVersion,
                                timedelta,
                                null
                            ) as any
                        );
                    })),
                this.#severity
            );

            this.notice?.(300999 as any, 'logger has been attached', null);
        }
    }
    get logger() {
        return this.#logger;
    }

    /**
     * Current severity level.
     *
     * NOTE:
     * - severity will always be `null` if no logger is attached.
     * - set to `null` to turn logging off.
     */
    set severity(severity: Severity | null) {
        const previousSeverity = this.#severity;
        if (previousSeverity !== severity) {
            const increase = (previousSeverity || 1000) < (severity || 1000);

            if (increase) logLevelChange(this, previousSeverity, severity, true);

            setLog(this, this.#log, (this.#severity = severity));

            if (!increase) logLevelChange(this, previousSeverity, severity);
        }
    }
    get severity() {
        return this.#logger ? this.#severity : null;
    }
}

export { LogAdapter as default };
