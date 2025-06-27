//?—————————————————————————————————————————————————————————————————————————————————————————?//
//?                                       THIS IS IT                                        ?//
///
//# All job files that are intended to be registered and actually executed must be exported
//# from this file. The job class files SHOULD not contain any export, but simply a call to
//# the queue manager's registerJob method. Importing this file executes that call, and the
//# queue is created in the system.
//#
//# This is the PREFFERED, INTENDED and ONLY proper way to do this. There is no assumption
//# about where this will be imported. The best way (that is probably currently used...)
//# is to do this inside the queue manager's initialize method, because it does not make
//# any sense to do so earlier. Doing it later is also wierd because everything the manager
//# does depends on the jobs being registered.
//#
//# Deleting an export of a job from here removes it from the app. Use that for jobs that
//# are temporarily not needed.
///
//§—————————————————————————————————————————————————————————————————————————————————————————§//
//§                                         WARNING                                         §//
///
//# If multiple jobs share the same queue (which they definitely can), ONLY THE FIRST job
//# as ordered here will apply its settings to the queue. If the goal is to customize
//# two jobs on the same queue differently, the only solution available without some major
//# wohack shit is to simply split the jobs into two different queues. There is nothing
//# wrong about that and should be done liberally.
///
//§—————————————————————————————————————————————————————————————————————————————————————————§//

//|-----------------------------------------------------------------------------------------|//
//?                                         EMAILS                                          ?//
//|-----------------------------------------------------------------------------------------|//

export * from './emails/SendVerificationEmailJob';
export * from './emails/SendPasswordResetEmailJob';

//|-----------------------------------------------------------------------------------------|//
//?                                        SEARCH                                          ?//
//|-----------------------------------------------------------------------------------------|//

export * from './search/ReindexRecipesJob';
