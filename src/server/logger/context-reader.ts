//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                       DEPENDENCY HELL                                       ?//
///
//# The logger uses request scoped info (like user and request ids) to descriptively
//# annotate individual log entries. These values come from the RequestContext, but importing
//# it directly into the logger creates circular dependencies as the context itself depends
//# on session manager and decoupling those two proved much more pain than i ever expected...
//#
//# This utility exists to eliminate that problem. It owns a mutable reader reference,
//# initialized to a noop at the start. After the RequestContext module is loaded, the setter
//# from here should be called to connect it with the logger (which itself reads the context
//# with the provided getter).
//#
//# The only time where the noop fires is during the very first Logger initialization,
//# which should not matter as no real requests are being logged yet.
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

type ContextReader = {
    getRequestId(): string | null;
    getUserId(): number | null;
};

const noop: ContextReader = {
    getRequestId: () => null,
    getUserId: () => null
};

let reader: ContextReader = noop;

export function setLoggerContextReader(r: ContextReader): void {
    reader = r;
}

export function getLoggerContext(): ContextReader {
    return reader;
}
