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
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            devicePixelRatio: window.devicePixelRatio,
            hardwareConcurrency: navigator.hardwareConcurrency || 'N/A',
            deviceMemory: navigator.deviceMemory || 'N/A',
            networkType: navigator.connection
                ? navigator.connection.effectiveType
                : 'unknown'
        },

        performanceMetrics: {},

        errors: []
    };

    // Colectare metrici performanță
    function collectPerformanceMetrics() {

        if (!window.performance || !window.performance.getEntriesByType) {
            return;
        }

        const navEntries = performance.getEntriesByType('navigation');

        if (navEntries.length > 0) {

            const timing = navEntries[0];

            telemetryData.performanceMetrics.dnsTime =
                timing.domainLookupEnd - timing.domainLookupStart;

            telemetryData.performanceMetrics.tcpHandshake =
                timing.connectEnd - timing.connectStart;

            telemetryData.performanceMetrics.ttfb =
                timing.responseStart - timing.requestStart;

            telemetryData.performanceMetrics.domInteractive =
                timing.domInteractive;

            telemetryData.performanceMetrics.loadEvent =
                timing.loadEventEnd - timing.loadEventStart;
        }

        // Paint Metrics
        const paintEntries = performance.getEntriesByType('paint');

        paintEntries.forEach((entry) => {

            if (entry.name === 'first-paint') {
                telemetryData.performanceMetrics.firstPaint = entry.startTime;
            }

            if (entry.name === 'first-contentful-paint') {
                telemetryData.performanceMetrics.firstContentfulPaint = entry.startTime;
            }
        });

        dispatchTelemetry();
    }

    // Beacon dispatch
    function dispatchTelemetry() {

        const payload = JSON.stringify(telemetryData);

        const endpoint =
            'https://analytics.rc251.utm.md/api/telemetry';

        console.log(
            '%c[TELEMETRIE ACTIVE] JSON:',
            'color:#00f2ff;font-weight:bold;',
            telemetryData
        );

        if (navigator.sendBeacon) {

            navigator.sendBeacon(endpoint, payload);

        } else {

            const xhr = new XMLHttpRequest();

            xhr.open('POST', endpoint, true);

            xhr.setRequestHeader(
                'Content-Type',
                'application/json'
            );

            xhr.send(payload);
        }
    }

    // Error Tracking
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
            timestamp: new Date().toISOString()
        });

        dispatchTelemetry();
    };

    // FID Estimation
    let firstInteraction = false;

    document.addEventListener(
        'click',
        function (event) {

            if (firstInteraction) return;

            firstInteraction = true;

            const delay =
                performance.now() - event.timeStamp;

            telemetryData.performanceMetrics.firstInputDelay =
                delay;

            console.log(
                '[FID ESTIMATION]',
                delay.toFixed(2) + 'ms'
            );
        },
        { passive: true }
    );

    // requestIdleCallback optimization
    function initTelemetry() {

        setTimeout(collectPerformanceMetrics, 500);
    }

    window.addEventListener('load', function () {

        if ('requestIdleCallback' in window) {

            requestIdleCallback(initTelemetry);

        } else {

            setTimeout(initTelemetry, 1000);
        }
    });

})();