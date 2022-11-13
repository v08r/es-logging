import { Severity } from '../src/constants';
import LogAdapter from '../src/LogAdapter';

const replaceTimedeltaFromCalls = (calls: Array<Array<any>>) => {
    for (const call of calls) for (const arg of call) arg.timedelta = 42;
};

describe('`LogAdapter`', () => {
    const productID = 'productID';
    const productVersion = 1;

    const logger1 = { log: jest.fn() };
    const logger2 = { log: jest.fn() };

    const la = new LogAdapter(productID, productVersion);

    test('creation', () => {
        for (const k of [
            'debug',
            'info',
            'notice',
            'warning',
            'error',
            'critical',
            'alert',
            'emergency',
            'logger',
        ] as const)
            expect(la[k]).toBe(undefined);
        expect(la.severity).toBe(null);
    });

    test('lifecycle', () => {
        la.severity = Severity.Error;
        expect(la.severity).toBe(null);

        la.logger = logger1;
        expect(la.logger).toBe(logger1);
        expect(la.severity).toBe(Severity.Error);
        for (const k of ['debug', 'info', 'notice', 'warning'] as const)
            expect(la[k]).toBe(undefined);
        for (const k of ['error', 'critical', 'alert', 'emergency'] as const)
            expect(typeof la[k]).toBe('function');

        la.severity = Severity.Notice;
        expect(la.severity).toBe(Severity.Notice);
        for (const k of ['debug', 'info'] as const) expect(la[k]).toBe(undefined);
        for (const k of ['notice', 'warning', 'error', 'critical', 'alert', 'emergency'] as const)
            expect(typeof la[k]).toBe('function');

        la.logger = logger2;
        expect(la.logger).toBe(logger2);

        la.severity = Severity.Warning;
        expect(la.severity).toBe(Severity.Warning);
        for (const k of ['debug', 'info', 'notice'] as const) expect(la[k]).toBe(undefined);
        for (const k of ['warning', 'error', 'critical', 'alert', 'emergency'] as const)
            expect(typeof la[k]).toBe('function');

        la.severity = null;
        expect(la.severity).toBe(null);
        for (const k of [
            'debug',
            'info',
            'notice',
            'warning',
            'error',
            'critical',
            'alert',
            'emergency',
        ] as const)
            expect(la[k]).toBe(undefined);

        la.severity = Severity.Debug;
        expect(la.severity).toBe(Severity.Debug);
        for (const k of [
            'debug',
            'info',
            'notice',
            'warning',
            'error',
            'critical',
            'alert',
            'emergency',
        ] as const)
            expect(typeof la[k]).toBe('function');

        la.logger = undefined;
        for (const k of [
            'debug',
            'info',
            'notice',
            'warning',
            'error',
            'critical',
            'alert',
            'emergency',
            'logger',
        ] as const)
            expect(la[k]).toBe(undefined);
        expect(la.severity).toBe(null);

        for (const {
            log: {
                mock: { calls },
            },
        } of [logger1, logger2]) {
            replaceTimedeltaFromCalls(calls);
            expect(calls).toMatchSnapshot();
        }
    });
});
