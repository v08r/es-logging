import type { Code } from './codes';
import { InvalidTimestampError } from './error';
import type { MaybeReadonly, SeverityFromCode } from './types';

const normalizeTimestamp = (ts?: number | string | Date | null | undefined) => {
    if (ts == null) return null;

    let lts = ts;
    if (typeof lts === 'string') lts = new Date(lts);
    if (typeof lts === 'object') lts = lts.getTime();

    if (isNaN(lts)) throw new InvalidTimestampError(ts);

    return lts;
};

/** Log entry. */
class Entry<
    TD extends number,
    PID extends string,
    PV extends number,
    C extends Code,
    M extends string,
    P
> {
    /**
     * [JSON reviver](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#the_reviver_parameter)
     * factory for `Entry`.
     *
     * @param keyFilter function to identify properties to be "revived". Pass
     *                  `(key: string) => key === ""` to parse the JSON root.
     */
    static reviver(keyFilter: (key: string) => boolean) {
        return (key: string, value: any) => {
            return keyFilter(key) &&
                Array.isArray(value) &&
                value.length === 8 &&
                (typeof value[0] === 'number' || value[0] === null) &&
                typeof value[1] === 'number' &&
                typeof value[2] === 'string' &&
                typeof value[3] === 'string' &&
                typeof value[4] === 'number' &&
                typeof value[5] === 'number' &&
                typeof value[6] === 'string'
                ? new Entry(value as any)
                : value;
        };
    }

    /** Log entry code. */
    readonly code: C;
    /**
     * Logger ID.
     *
     * NOTE: it is expected that a logger would mutate this property
     *       before logging the entry.
     */
    loggerID: string;
    /** Log entry message. */
    readonly message: M;
    /** Log entry payload. */
    readonly payload: P;
    /** ID of the software product creating the log entry. */
    readonly productID: PID;
    /** Version of the software product creating the log entry. */
    readonly productVersion: PV;
    /**
     * Milliseconds since [time origin](https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp#the_time_origin)
     * when the log entry was created.
     */
    readonly timedelta: TD;
    /**
     * Milliseconds since the [ECMAScript epoch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_ecmascript_epoch_and_timestamps).
     * May be `null`.
     *
     * NOTE: it is expected that a logger would mutate this property
     *       before logging the entry.
     */
    readonly timestamp: number | null;

    /**
     * @param code log entry code.
     * @param loggerID logger ID.
     * @param message log entry message.
     * @param payload log entry payload.
     * @param productID ID of the software product creating the log entry.
     * @param productVersion Version of the software product
     *                       creating the log entry.
     * @param timedelta Milliseconds since [time origin](https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp#the_time_origin)
     *                  when the log entry was created.
     * @param timestamp Timestamp as milliseconds since the [ECMAScript epoch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_ecmascript_epoch_and_timestamps),
     *                  JSON representation for a `Date`, `Date` or `null`
     */
    constructor(
        code: C,
        loggerID: string,
        message: M,
        payload: P,
        productID: PID,
        productVersion: PV,
        timedelta: TD,
        timestamp: number | string | Date | null
    );
    /**
     * @param data Array including timestamp, timedelta, logger ID, product ID,
     *             product version, code, message and payload
     *             (in the mentioned order).
     */
    constructor(data: MaybeReadonly<[number | string | Date | null, TD, string, PID, PV, C, M, P]>);
    /**
     * @param json JSON representation for an `Entry`.
     */
    constructor(json: string);
    constructor(
        jsonDataOrCode:
            | string
            | MaybeReadonly<[number | string | Date | null, TD, string, PID, PV, C, M, P]>
            | C,
        loggerID?: string,
        message?: M,
        payload?: P,
        productID?: PID,
        productVersion?: PV,
        timedelta?: TD,
        timestamp?: number | string | Date | null
    ) {
        let c: C;
        let lid: string;
        let m: M;
        let p: P;
        let pid: PID;
        let pv: PV;
        let td: TD;
        let ts: number | string | Date | null | undefined;

        if (typeof jsonDataOrCode === 'number') {
            c = jsonDataOrCode;
            lid = loggerID as string;
            m = message as M;
            p = payload as P;
            pid = productID as PID;
            pv = productVersion as PV;
            td = timedelta as TD;
            ts = timestamp;
        } else
            [ts, td, lid, pid, pv, c, m, p] =
                typeof jsonDataOrCode === 'string' ? JSON.parse(jsonDataOrCode) : jsonDataOrCode;

        this.code = c;
        this.loggerID = lid;
        this.message = m;
        this.payload = p;
        this.productID = pid;
        this.productVersion = pv;
        this.timedelta = td;
        this.timestamp = normalizeTimestamp(ts);
    }

    /** Severity for the log entry. */
    get severity() {
        return Math.floor(this.code / 1000) as SeverityFromCode<C>;
    }

    /** Timestamp for the log entry. */
    getTimeStamp() {
        const { timestamp } = this;
        return timestamp === null ? null : new Date(timestamp);
    }

    /** Sets the timestamp for the log entry. */
    setTimestamp(timestamp: number | string | Date) {
        (this as any).timestamp = normalizeTimestamp(timestamp);
        return this;
    }

    /** Converts the `Entry` into an array suitable for JSON serialization. */
    toJSON() {
        return [
            this.timestamp,
            this.timedelta,
            this.loggerID,
            this.productID,
            this.productVersion,
            this.code,
            this.message,
            this.payload,
        ] as [number | null, TD, string, PID, PV, C, M, P];
    }
}

export { Entry as default };
