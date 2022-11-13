import Entry from './Entry';
import { InvalidTimestampError } from './error';

describe('`Entry`', () => {
    describe.each([
        {
            data: {
                code: 100111,
                loggerID: '',
                message: '',
                payload: null,
                productID: '',
                productVersion: 0,
                severity: 100,
                timedelta: 0,
                timestamp: null,
            } as const,
            json: `[null,0,"","",0,100111,"",null]`,
            label: 'TC 1',
        },
        {
            data: {
                code: 400999,
                loggerID: 'logger ID',
                message: 'message',
                payload: { answer: 42 },
                productID: 'product ID',
                productVersion: 2,
                severity: 400,
                timedelta: 21,
                timestamp: 4200,
            } as const,
            json: `[4200,21,"logger ID","product ID",2,400999,"message",{"answer":42}]`,
            label: 'TC 2',
        },
    ])('$label', ({ data, json }) => {
        const {
            code,
            loggerID,
            message,
            payload,
            productID,
            productVersion,
            timedelta,
            timestamp,
        } = data;
        const arrData = [
            timestamp,
            timedelta,
            loggerID,
            productID,
            productVersion,
            code,
            message,
            payload,
        ] as const;

        const e1 = new Entry(
            code,
            loggerID,
            message,
            payload,
            productID,
            productVersion,
            timedelta,
            timestamp
        );
        const e2 = new Entry(arrData);
        const e3 = new Entry(json);

        const entries = [e1, e2, e3];

        test('creation', () => {
            for (const e of entries)
                for (const key of [
                    'code',
                    'loggerID',
                    'message',
                    'payload',
                    'productID',
                    'productVersion',
                    'severity',
                    'timedelta',
                    'timestamp',
                ])
                    expect(JSON.stringify(e[key as keyof typeof e])).toBe(
                        JSON.stringify(data[key as keyof typeof data])
                    );
        });

        test('serialization', () => {
            for (const e of entries) expect(JSON.stringify(e)).toBe(json);
        });

        test('getters', () => {
            if (typeof timestamp === 'number') expect(e1.getTimeStamp()!.getTime()).toBe(timestamp);
            else expect(e1.getTimeStamp()).toBe(null);
        });

        test('setters', () => {
            e1.loggerID = 'new Logger ID';
            expect(e1.loggerID).toBe('new Logger ID');

            e1.setTimestamp(42);
            expect(e1.timestamp).toBe(42);

            let error: InvalidTimestampError<any>;

            try {
                e1.setTimestamp('invalid date');
            } catch (e) {
                error = e as any;
            }
            expect(error!.name).toBe('InvalidTimestampError');
            expect(error!.timestamp).toBe('invalid date');

            const invalidDate = new Date('invalid date');
            try {
                e1.setTimestamp(invalidDate);
            } catch (e) {
                error = e as any;
            }
            expect(error!.name).toBe('InvalidTimestampError');
            expect(error!.timestamp).toBe(invalidDate);

            try {
                e1.setTimestamp(NaN);
            } catch (e) {
                error = e as any;
            }
            expect(error!.name).toBe('InvalidTimestampError');
            expect(error!.timestamp).toBe(NaN);

            const now = new Date();
            const time = now.getTime();
            e1.setTimestamp(now);
            expect(e1.timestamp).toBe(time);
            expect(e1.getTimeStamp()?.getTime()).toBe(time);
            e1.setTimestamp(now.toISOString());
            expect(e1.timestamp).toBe(time);
            expect(e1.getTimeStamp()?.getTime()).toBe(time);
        });
    });

    describe('reviver', () => {
        test.each([
            {
                json: `[null,0,"","",0,100111,"",null]`,
                keyFilter: (key: string) => key === '',
                label: `root`,
            },
            {
                json: `{"entry": [null,0,"","",0,100111,"",null]}`,
                keyFilter: (key: string) => key === 'entry',
                label: `property`,
            },
        ])(`$label`, ({ label, keyFilter, json }) => {
            const e = JSON.parse(json, Entry.reviver(keyFilter));

            expect(label === 'property' ? e.entry : e).toBeInstanceOf(Entry);
        });
    });
});
