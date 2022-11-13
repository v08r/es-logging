/** Severity of log entries. */
enum Severity {
    /** Debug or trace information. */
    Debug = 100,
    /** Routine information, such as ongoing status or performance. */
    Info = 200,
    /**
     * Normal but significant events, such as start up, shut down, or
     * a configuration change.
     */
    Notice = 300,
    /** Warning events might cause problems. */
    Warning = 400,
    /** Error events are likely to cause problems. */
    Error = 500,
    /** Critical events cause more severe problems or outages. */
    Critical = 600,
    /** A person must take an action immediately. */
    Alert = 700,
    /** One or more systems are unusable.  */
    Emergency = 800,
}

export { Severity };
