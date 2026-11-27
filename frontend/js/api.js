const Api = {
    async fetchData(action, params = {}, forceRefresh = false) {
        const cacheKey = `${action}_${JSON.stringify(params)}`;

        if (APP_CONFIG.CLIENT_CACHE_TTL_MINUTES > 0 && !forceRefresh) {
            const cachedData = CacheManager.get(cacheKey);
            if (cachedData) return cachedData;
        }

        const url = new URL(APP_CONFIG.API_URL);
        url.searchParams.append('action', action);
        url.searchParams.append('t', Date.now());
        
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        try {
            const response = await fetch(url.toString());
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            const json = await response.json();
            const isSuccess = json.success === true || json.status === 'ok';
            
            if (!isSuccess) {
                let errMsg = 'Unknown API error';
                if (typeof json.error === 'string') errMsg = json.error;
                else if (json.error && json.error.messageAr) errMsg = json.error.messageAr;
                throw new Error(errMsg);
            }

            const data = json.data;
            if (APP_CONFIG.CLIENT_CACHE_TTL_MINUTES > 0) CacheManager.set(cacheKey, data);
            return data;
        } catch (error) {
            return ErrorHandler.handleApiError(error);
        }
    },

    async getYears(forceRefresh = false) { return this.fetchData('listYears', {}, forceRefresh); },
    async getTerms(year, forceRefresh = false) { return this.fetchData('listTerms', { year }, forceRefresh); },
    async getSubjects(year, term, forceRefresh = false) { return this.fetchData('listSubjects', { year, term }, forceRefresh); },
    async getFiles(year, term, subject, forceRefresh = false) { return this.fetchData('listFiles', { year, term, subject }, forceRefresh); },
    async getNews(forceRefresh = false) { return this.fetchData('news', {}, forceRefresh); },
    async getAnnouncements(forceRefresh = false) { return this.fetchData('announcements', {}, forceRefresh); },
    async getNewsImages(forceRefresh = false) { return this.fetchData('getImages', {}, forceRefresh); },
    async getRecentUpdates(since = 0, forceRefresh = true) { return this.fetchData('recentUpdates', { since: since }, forceRefresh); }
};