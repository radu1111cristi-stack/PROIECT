/**
 * UI Telemetry Engine & Performance Monitor
 * Autor: Radu Cristian | Expert RC 251
 * Data: 15.05.2026 | No-Dependency GDPR Beacon
 */

(function () {
    'use strict';

    const telemetryData = {
        appId: 'RC251-UTM-PORTFOLIO',

        timestamp: new Date().toISOString(),

        environment: {
            screenResolution:
                `${window.screen.width}x${window.screen.height}`,

            viewportSize:
                `${window.innerWidth}x${window.innerHeight}`,

            devicePixelRatio:
                window.devicePixelRatio,

            hardwareConcurrency:
                navigator.hardwareConcurrency || 'N/A',

            deviceMemory:
                navigator.deviceMemory || 'N/A',

            networkType:
                navigator.connection
                    ? navigator.connection.effectiveType
                    : 'unknown'
        },

        performanceMetrics: {},

        errors: []
    };

    // Colectare metrici performanță
    function collectPerformanceMetrics() {

        if (
            !window.performance ||
            !window.performance.getEntriesByType
        ) {
            return;
        }

        const navEntries =
            performance.getEntriesByType('navigation');

        if (navEntries.length > 0) {

            const timing = navEntries[0];

            telemetryData.performanceMetrics.dnsTime =
                timing.domainLookupEnd -
                timing.domainLookupStart;

            telemetryData.performanceMetrics.tcpHandshake =
                timing.connectEnd -
                timing.connectStart;

            telemetryData.performanceMetrics.ttfb =
                timing.responseStart -
                timing.requestStart;

            telemetryData.performanceMetrics.domInteractive =
                Math.round(timing.domInteractive);

            telemetryData.performanceMetrics.loadEvent =
                Math.round(
                    timing.loadEventEnd -
                    timing.loadEventStart
                );
        }

        // Paint metrics
        const paintEntries =
            performance.getEntriesByType('paint');

        paintEntries.forEach((entry) => {

            if (entry.name === 'first-paint') {

                telemetryData.performanceMetrics.firstPaint =
                    Math.round(entry.startTime);
            }

            if (
                entry.name ===
                'first-contentful-paint'
            ) {

                telemetryData.performanceMetrics
                    .firstContentfulPaint =
                    Math.round(entry.startTime);
            }
        });

        dispatchTelemetry();
    }

    // Simulare beacon GDPR-safe
    function dispatchTelemetry() {

        const payload =
            JSON.stringify(telemetryData);

        console.log(
            '%c[TELEMETRIE ACTIVE] JSON:',
            'color:#00f2ff;font-weight:bold;',
            telemetryData
        );

        // Simulare beacon fără request extern
        console.log(
            '%c[BEACON SIMULATED]',
            'color:#00ff88;font-weight:bold;',
            payload
        );
    }

    // Error tracking
    window.onerror = function (
        message,
        source,
        lineno,
        colno
    ) {

        telemetryData.errors.push({
            message,
            source,
            line: lineno,
            column: colno,
            timestamp:
                new Date().toISOString()
        });

        console.warn(
            '[Telemetry Error Captured]',
            message
        );
    };

    // FID estimation
    let firstInteraction = false;

    document.addEventListener(
        'click',
        function (event) {

            if (firstInteraction) return;

            firstInteraction = true;

            const delay =
                performance.now() -
                event.timeStamp;

            telemetryData.performanceMetrics
                .firstInputDelay =
                Math.round(delay);

            console.log(
                '%c[FID ESTIMATION]',
                'color:#ffaa00;font-weight:bold;',
                delay.toFixed(2) + 'ms'
            );
        },
        { passive: true }
    );

    // Optimizare Lighthouse
    function initTelemetry() {

        setTimeout(
            collectPerformanceMetrics,
            300
        );
    }

    window.addEventListener(
        'load',
        function () {

            if (
                'requestIdleCallback'
                in window
            ) {

                requestIdleCallback(
                    initTelemetry
                );

            } else {

                setTimeout(
                    initTelemetry,
                    1000
                );
            }
        }
    );

})();