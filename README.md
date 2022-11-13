# @verncular/es-logging &middot; [![Coverage Status](https://coveralls.io/repos/github/v08r/es-logging/badge.svg)](https://coveralls.io/github/v08r/es-logging)

Logging utils.

## Installation

```bash
npm install @vernacular/es-logging
```

## Usage

```typescript
import { name, version } from 'path/to/package.json/for/example';
import { LogAdapter, Severity } from '@vernacular/es-logging';
import loggerOfChoice from 'my-logger-of-choice';

/** Initialize your logger however you like 😉 */
const logger = loggerOfChoice();

class MyClass {
    /** voilà! my class now **has** a log adapter! 😎 */
    readonly log = new LogAdapter(name, Number(version.split('.')[0]));
}

const myClass = new MyClass();

/** Set the logger severity. */
myClass.log.severity = Severity.Info;

/** Set the logger. */
myClass.log.logger = {
    log: (entry) => {
        /** Extract any info you need from the entry. */
        const {
            code,
            message,
            payload,
            productID,
            productVersion,
            severity,
            timedelta,
            timestamp,
        } = entry.setTimestamp(Date.now());

        /** Log through the attached logger. */
        logger.log(severity, message)
    },
};

/** Log! */
myClass.log.info(200111, "some info", { answer: 42 });

/** Initialize another logger */
const logger2 = loggerOfChoice();

/** Switch loggers */
myClass.log.logger = {
    log: (entry) => logger2.log(entry);
};

/** Log! */
myClass.log.debug(100111, "some debug info", { situation: "normal" });
```

## License

[MIT](./LICENSE) © 2022 Fernando G. Vilar.
