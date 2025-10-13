/**
 * Efficiently computes the intersection of an arbitrary number of arrays that may contain
 * objects, primitives, or a mixture of both. The implementation focuses purely on speed –
 * memory consumption and code complexity are secondary concerns.
 *
 * HOW IT WORKS – HIGH-LEVEL OVERVIEW
 * ----------------------------------
 * 1.  Early-exit for trivial cases (no arrays, an empty array, arrays of length 1 …).
 * 2.  Sort the input so that the **shortest** array is processed first.  This minimises the
 *     number of hash-table entries we create (we never store keys that are guaranteed to be
 *     absent from the result).
 * 3.  Use a `Map` as a counting hash-table.  Keys are generated via the user-supplied
 *     `keySelector` function (defaults to the identity function so `===` is used for
 *     primitives and reference equality for objects).
 * 4.  Iterate through each array exactly once.  For any given key we track how many distinct
 *     arrays it has appeared in so far.  To prevent **duplicate values inside a single
 *     array** from artificially inflating the count we keep a per-pass `Set` of keys that
 *     have already been seen during the current outer iteration.
 * 5.  Once a key has been observed in *all* input arrays (`count === arrays.length`) we know
 *     it belongs in the intersection.  We still continue scanning to warm the CPU cache and
 *     avoid unpredictable branches – but the final extraction of results is an O(n) sweep
 *     over the map (where *n* is the key space of the smallest array, often much smaller
 *     than the total element count).
 *
 * PERFORMANCE NOTES
 * -----------------
 * •  Using a `Map` instead of an object avoids prototype look-ups and permits any value type
 *    as a key (including objects and `NaN`).
 * •  Sorting by length has an *O(m·log m)* cost (where *m* = number of arrays) which is
 *    negligible compared to the typical element count.
 * •  The algorithm is linear in the total element count: *Θ(Σ |Aᵢ|)*.
 *
 * @template T  The element type contained in the arrays.
 * @template K  The hash-key type returned by `keySelector` (string, number, object, …).
 *
 * @param arrays       An array of arrays whose intersection should be calculated.
 *                     The function does **not** mutate the input.
 * @param keySelector  Optional.  A function that maps an element to a hash-key.  Elements
 *                     yielding the same key are considered equal.  Defaults to the identity
 *                     function (strict `===` comparison / reference equality).
 *
 * @returns A new array that contains a single representative for every element that appears
 *          in *all* of the input arrays.  The order of the returned elements follows the
 *          order in the **shortest** input array (stable & deterministic).
 */
export function intersectArrays<T, K = unknown>(
    arrays: readonly (readonly T[])[],
    keySelector: (item: T) => K = (item) => item as unknown as K
): T[] {
    // ------------------------------
    // 1. Early-exit & Sanity Checks
    // ------------------------------

    if (arrays.length === 0) return [];

    // If *any* array is empty there can be no intersection.
    // We do this before the costly `sort` – O(m) vs. O(m·log m).
    for (const arr of arrays) {
        if (arr.length === 0) return [];
    }

    // ----------------------------------------------
    // 2. Process the smallest array first for speed.
    // ----------------------------------------------
    // Create a shallow copy so that we do **not** mutate the caller-provided list order.
    const arraysBySize = [...arrays].sort((a, b) => a.length - b.length);

    // Numeric ID representing how many arrays we have already processed.
    // Using an integer rather than a boolean flag per array avoids re-allocating a
    // fresh Map for every pass – we just increment `pass`.
    let pass = 0;

    // The counting hash-table: key -> { item, count }.
    interface Bucket {
        item: T; // One *representative* instance for this key (stable reference).
        count: number; // In how many *distinct* arrays has this key appeared so far?
    }

    const buckets = new Map<K, Bucket>();

    // ------------------------------------------------------------
    // 3. First pass – populate buckets using the *shortest* array.
    // ------------------------------------------------------------
    {
        const first = arraysBySize[0];

        if (!first) {
            return [];
        }

        for (const item of first) {
            const key = keySelector(item);
            // We only set the bucket if it does not exist yet – duplicate keys inside the first
            // array have no effect on the outcome and would waste cycles.
            if (!buckets.has(key)) {
                buckets.set(key, {
                    item,
                    count: 1 /* present in 1 array so far */
                });
            }
        }
    }

    // If the smallest array had only unique elements, `buckets.size` already reflects the
    // upper bound of our result set.  Each subsequent pass can only *decrease* that number.

    // ----------------------------------------------------
    // 4. Subsequent passes – update counters in-place.
    // ----------------------------------------------------
    for (pass = 1; pass < arraysBySize.length; pass++) {
        const arr = arraysBySize[pass];

        // `seenInThisArray` prevents multiple occurrences of the same key within the
        // current array from counting multiple times.
        const seenInThisArray = new Set<K>();

        if (!arr) {
            continue;
        }

        for (const item of arr) {
            const key = keySelector(item);
            if (seenInThisArray.has(key)) continue; // Skip duplicates within this array.
            seenInThisArray.add(key);

            const bucket = buckets.get(key);
            if (bucket && bucket.count === pass) {
                // The key has appeared in *all* previous arrays (pass times so far).
                bucket.count++;
            }
        }

        // Remove keys that did NOT appear in the current array – they cannot be part
        // of the final intersection.
        for (const [key, bucket] of buckets) {
            if (bucket.count !== pass + 1) {
                buckets.delete(key);
            }
        }

        // Early bail-out if no candidates remain.
        if (buckets.size === 0) return [];
    }

    // -----------------------------------------
    // 5. Assemble the result in stable order.
    // -----------------------------------------
    const result: T[] = [];
    const firstArray = arraysBySize[0];
    const emitted = new Set<K>();

    if (!firstArray) {
        return [];
    }

    for (const item of firstArray) {
        const key = keySelector(item);
        if (emitted.has(key)) continue; // Skip duplicates originating from first array.

        const bucket = buckets.get(key);
        if (bucket && bucket.count === arraysBySize.length) {
            result.push(bucket.item);
            emitted.add(key);
        }
    }

    return result;
}
