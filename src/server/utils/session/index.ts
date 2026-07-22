//§—————————————————————————————————————————————————————————————————————————————————————————————§//
//§                                    SESSION PUBLIC API                                       §//
///
//# There is intentionally not a full barrel file here. This module contains nextjs runtime
//# dependencies, which are note safe to call from every consumer. Having to import them
//# directly by path is the easiest "guard" against unexpected runtime errors, which
//# (as i found the hard way) might be quite difficult to debug...
///
//§—————————————————————————————————————————————————————————————————————————————————————————————§//

export * from './manager';
