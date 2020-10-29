/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.mozilla.fenix.ui

import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.uiautomator.UiDevice
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test
import org.mozilla.fenix.perf.RunBlockingCounter
import org.mozilla.fenix.ext.components
import org.mozilla.fenix.helpers.HomeActivityTestRule

// PLEASE CONSULT WITH PERF TEAM BEFORE CHANGING THIS VALUE.
private const val EXPECTED_SUPPRESSION_COUNT = 11

private const val EXPECTED_RUNBLOCKING_COUNT = 2
private const val STRICTMODE_FAILURE_MSG = """StrictMode startup suppression count does not match expected count.
    
    If this PR removed code that suppressed StrictMode, great! Please decrement the suppression count.
    
    Did this PR add or call code that suppresses a StrictMode violation?
    Did you know that suppressing a StrictMode violation can introduce performance regressions?

    If so, please do your best to implement a solution without suppressing StrictMode.
    Please consult the perf team if you have questions or believe suppressing StrictMode
    is the optimal solution.

"""

private const val RUNBLOCKING_FAILURE_MSG = """RunblockingCounter startup count does not match expected count.
    
    If this PR removed code that removed a RunBlocking call, great! Please decrement the suppression count.
    
    Did this PR add or call code that incremented the RunBlockingCounter?
    Did you know that using runBlocking can have negative perfomance implications?

    If so, please do your best to implement a solution without blocking the main thread.
    Please consult the perf team if you have questions or believe that using runBlocking
    is the optimal solution.

"""

/**
 * A performance test to limit the number of StrictMode suppressions and number of runBlocking used
 * on startup.
 *
 * This test was written by the perf team.
 *
 * StrictMode detects main thread IO, which is often indicative of a performance issue.
 * It's easy to suppress StrictMode so we wrote a test to ensure we have a discussion
 * if the StrictMode count changes.
 *
 * RunBlocking is mostly used to return values to a thread from a coroutine. However, if that
 * coroutine takes too long, it can lead that thread to block every other operations.
 *
 * The perf team is code owners for this file so they should be notified when the count is modified.
 *
 * IF YOU UPDATE THE TEST NAME, UPDATE CODE OWNERS.
 */
class StartupExcessiveResourceUseTest {
    @get:Rule
    val activityTestRule = HomeActivityTestRule(skipOnboarding = true)

    private val uiDevice = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation())

    @Test
    fun verifyRunBlockingAndStrictModeSuppresionCount() {
        uiDevice.waitForIdle() // wait for async UI to load.

        // This might cause intermittents: at an arbitrary point after start up (such as the visual
        // completeness queue), we might run code on the main thread that suppresses StrictMode,
        // causing this number to fluctuate depending on device speed. We'll deal with it if it occurs.
        val actualSuppresionCount = activityTestRule.activity.components.strictMode.suppressionCount.get().toInt()
        val actualRunBlocking = RunBlockingCounter.count.get()

        assertEquals(STRICTMODE_FAILURE_MSG, EXPECTED_SUPPRESSION_COUNT, actualSuppresionCount)
        assertEquals(RUNBLOCKING_FAILURE_MSG, EXPECTED_RUNBLOCKING_COUNT, actualRunBlocking)
    }
}
