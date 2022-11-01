export const throttle = <F extends (...args: any[]) => any>(func: F, delay: number, runAfterThrottleEnd = false) => {
    let timeout: NodeJS.Timeout | undefined;
    let lastCalled = 0;

    return {
        callable: (...args: Parameters<F>): ReturnType<F> | undefined => {
            const run = () => {
                clearTimeout(timeout);
                lastCalled = new Date().getTime();
                return func(...args);
            };

            const now = new Date().getTime();
            if (now - lastCalled < delay) {
                if (!runAfterThrottleEnd) return;

                clearTimeout(timeout);
                timeout = setTimeout(run, delay - (now - lastCalled));
            } else {
                return run();
            }
        },
        reset: (setLastCalled = false) => {
            if (setLastCalled) lastCalled = new Date().getTime();
            clearTimeout(timeout);
        }
    };
};
