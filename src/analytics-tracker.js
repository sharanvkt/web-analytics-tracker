// src/analytics-tracker.js

((function(window) {
    'use strict';
    
    const VERSION = '1.0.0';

    // Config object
    const config = {
        endpoint: null,
        projectId: null,
        initialized: false,
        DATABASE_ID: 'analytics_db',
        COLLECTIONS: {
            page_views: '67460888002b2e21ceae', // Update with your collection ID
            time_tracking: '67460945001156693068', // Update with your collection ID
            user_sessions: '6746090b0004e00e5989' // Update with your collection ID
        }
    };

    class Analytics {
        constructor() {
            this.version = VERSION;
            this.sessionId = this.getOrCreateSessionId();
            this.pageLoadTime = Date.now();
            this.lastActivityTime = this.pageLoadTime;
            this.isTracking = false;
        }

        // Initialize the tracker
        init(endpoint, projectId) {
            if (config.initialized) {
                console.warn('Analytics already initialized');
                return;
            }

            config.endpoint = endpoint;
            config.projectId = projectId;
            config.initialized = true;

            console.log('Analytics initialized with:', {
                endpoint,
                projectId,
                sessionId: this.sessionId
            });

            // Start tracking
            this.startTracking();
        }

        // Generate or retrieve session ID
        getOrCreateSessionId() {
            let sessionId = sessionStorage.getItem('analytics_session_id');
            if (!sessionId) {
                sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    const r = Math.random() * 16 | 0;
                    const v = c === 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
                sessionStorage.setItem('analytics_session_id', sessionId);
            }
            return sessionId;
        }

        // API request handler
        async sendToApi(collection, data) {
            if (!config.initialized) {
                console.error('Analytics not initialized');
                return;
            }

            const url = `${config.endpoint}/databases/${config.DATABASE_ID}/collections/${config.COLLECTIONS[collection]}/documents`;
            
            console.log('Sending analytics data:', {
                url,
                collection,
                data
            });

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Appwrite-Project': config.projectId
                    },
                    body: JSON.stringify({
                        documentId: 'unique()',
                        data: {
                            sessionId: this.sessionId,
                            ...data
                        }
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(JSON.stringify(errorData));
                }

                console.log(`Successfully sent ${collection} data`);
            } catch (error) {
                console.error(`Analytics Error (${collection}):`, error);
            }
        }

        // Start tracking
        startTracking() {
            if (this.isTracking) return;
            this.isTracking = true;

            // Record initial page view
            this.recordPageView();

            // Set up activity tracking
            this.setupActivityTracking();

            console.log('Tracking started');
        }

        // Record page view
        async recordPageView() {
            await this.sendToApi('page_views', {
                pageUrl: window.location.pathname,
                timestamp: new Date().toISOString()
            });
        }

        // Activity tracking setup
        setupActivityTracking() {
            document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
            window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        }

        // Visibility change handler
        handleVisibilityChange() {
            if (document.hidden) {
                this.updateTimeTracking();
            } else {
                this.lastActivityTime = Date.now();
            }
        }

        // Before unload handler
        handleBeforeUnload() {
            this.updateTimeTracking();
        }

        // Update time tracking
        async updateTimeTracking() {
            const duration = Math.floor((Date.now() - this.lastActivityTime) / 1000);
            if (duration > 0) {
                await this.sendToApi('time_tracking', {
                    pageUrl: window.location.pathname,
                    duration: duration,
                    timestamp: new Date().toISOString()
                });
            }
            this.lastActivityTime = Date.now();
        }
    }

    // Create global instance
    window.Analytics = window.Analytics || Analytics;
    window.analyticsTracker = new Analytics();
})(window));